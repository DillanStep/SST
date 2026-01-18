/**
 * @file economy.js
 * @description DayZ economy analysis - Types.xml parsing and spawn rate analytics
 * 
 * This module analyzes the server's economy by parsing types.xml files and
 * providing insights into item spawn rates, rarity, and market price correlations.
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 1.0.0
 * @lastUpdated 2025-01-15
 * 
 * ENDPOINTS:
 * - GET /                     - Global economy statistics overview
 * - GET /types                - Full types.xml data with spawn info
 * - GET /spawn-analysis       - Compare spawn rates vs market prices
 * - GET /spawn-stats          - Aggregate spawn statistics
 * - GET /item/:classname      - Get specific item economy data
 * 
 * DATA SOURCES:
 * - types.xml                 - DayZ Central Economy item definitions
 * - cfglimitsdefinition.xml   - Limit categories and values
 * - Expansion Market files    - For price correlation analysis
 * 
 * ANALYSIS FEATURES:
 * - Spawn rate calculation per item
 * - Rarity classification (common, uncommon, rare, etc.)
 * - Price vs spawn rate correlation
 * - Category-based spawn distribution
 * 
 * UTILITY IMPORTS:
 * - loadTypesData()          - Parses types.xml into usable structure
 * - analyzeSpawnVsPrice()    - Correlates spawn rates with prices
 * - getSpawnStats()          - Aggregate statistics
 * 
 * HOW TO EXTEND:
 * 1. Add new analysis endpoints as needed
 * 2. Consider caching expensive XML parsing operations
 * 3. Add support for modded item types.xml files
 */
import { Router } from "express";
import { readdir, readFile } from "../storage/fs.js";
import { paths } from "../config.js";
import { joinStoragePath } from "../utils/storagePath.js";
import { loadTypesData, analyzeSpawnVsPrice, getSpawnStats } from "../utils/typesParser.js";

const router = Router();

// Get global economy statistics
router.get("/", async (req, res) => {
  try {
    const tradesDir = paths.trades;
    const files = await readdir(tradesDir).catch(() => []);
    
    // Aggregate data
    let totalTransactions = 0;
    let totalPurchases = 0;
    let totalSales = 0;
    let totalMoneySpent = 0;
    let totalMoneyEarned = 0;
    let uniqueTraders = 0;
    
    // Item tracking
    const itemStats = new Map(); // className -> { purchases, sales, totalSpent, totalEarned, quantity }
    const traderStats = new Map(); // traderName -> { transactions, revenue }
    const zoneStats = new Map(); // zoneName -> { transactions, revenue }
    const hourlyActivity = new Array(24).fill(0); // Transactions per hour
    const recentTransactions = [];
    
    for (const file of files) {
      if (!file.endsWith("_trades.json")) continue;
      
      try {
        const filePath = joinStoragePath(tradesDir, file);
        const data = JSON.parse(await readFile(filePath, "utf8"));
        
        if (data.trades && data.trades.length > 0) {
          uniqueTraders++;
          totalPurchases += data.totalPurchases || 0;
          totalSales += data.totalSales || 0;
          totalMoneySpent += data.totalSpent || 0;
          totalMoneyEarned += data.totalEarned || 0;
          
          for (const trade of data.trades) {
            totalTransactions++;
            
            // Track item stats
            const itemKey = trade.itemClassName;
            if (!itemStats.has(itemKey)) {
              itemStats.set(itemKey, {
                className: trade.itemClassName,
                displayName: trade.itemDisplayName || trade.itemClassName,
                purchases: 0,
                sales: 0,
                totalSpent: 0,
                totalEarned: 0,
                quantity: 0,
                avgPrice: 0,
                lastSeen: trade.timestamp
              });
            }
            const item = itemStats.get(itemKey);
            if (trade.eventType === "PURCHASE") {
              item.purchases++;
              item.totalSpent += trade.price;
            } else {
              item.sales++;
              item.totalEarned += trade.price;
            }
            item.quantity += trade.quantity;
            item.avgPrice = Math.round((item.totalSpent + item.totalEarned) / (item.purchases + item.sales));
            if (trade.timestamp > item.lastSeen) item.lastSeen = trade.timestamp;
            
            // Track trader stats
            if (trade.traderName) {
              const traderKey = trade.traderName;
              if (!traderStats.has(traderKey)) {
                traderStats.set(traderKey, { name: traderKey, transactions: 0, revenue: 0, purchases: 0, sales: 0 });
              }
              const trader = traderStats.get(traderKey);
              trader.transactions++;
              if (trade.eventType === "PURCHASE") {
                trader.revenue += trade.price;
                trader.purchases++;
              } else {
                trader.revenue -= trade.price;
                trader.sales++;
              }
            }
            
            // Track zone stats
            if (trade.traderZone) {
              const zoneKey = trade.traderZone;
              if (!zoneStats.has(zoneKey)) {
                zoneStats.set(zoneKey, { name: zoneKey, transactions: 0, revenue: 0 });
              }
              const zone = zoneStats.get(zoneKey);
              zone.transactions++;
              if (trade.eventType === "PURCHASE") {
                zone.revenue += trade.price;
              } else {
                zone.revenue -= trade.price;
              }
            }
            
            // Track hourly activity
            try {
              const hour = new Date(trade.timestamp).getUTCHours();
              hourlyActivity[hour]++;
            } catch {}
            
            // Keep recent transactions (last 50)
            recentTransactions.push({
              ...trade,
              playerId: data.playerId,
            });
          }
        }
      } catch (err) {
        console.error(`Error reading trade file ${file}:`, err.message);
      }
    }
    
    // Sort and limit recent transactions
    recentTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const latestTransactions = recentTransactions.slice(0, 50);
    
    // Calculate top items by volume (purchases + sales)
    const topItemsByVolume = [...itemStats.values()]
      .sort((a, b) => (b.purchases + b.sales) - (a.purchases + a.sales))
      .slice(0, 20);
    
    // Calculate top items by money spent (most expensive purchases)
    const topItemsBySpending = [...itemStats.values()]
      .filter(i => i.purchases > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 20);
    
    // Calculate most sold items
    const topSoldItems = [...itemStats.values()]
      .filter(i => i.sales > 0)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 20);
    
    // Top traders by transactions
    const topTraders = [...traderStats.values()]
      .sort((a, b) => b.transactions - a.transactions)
      .slice(0, 10);
    
    // Top zones by transactions
    const topZones = [...zoneStats.values()]
      .sort((a, b) => b.transactions - a.transactions)
      .slice(0, 10);
    
    // Calculate data age range
    let oldestTransaction = null;
    let newestTransaction = null;
    for (const tx of recentTransactions) {
      const txDate = new Date(tx.timestamp);
      if (!oldestTransaction || txDate < oldestTransaction) oldestTransaction = txDate;
      if (!newestTransaction || txDate > newestTransaction) newestTransaction = txDate;
    }
    // Also check all items for oldest data
    for (const item of itemStats.values()) {
      if (item.lastSeen) {
        const itemDate = new Date(item.lastSeen);
        if (!oldestTransaction || itemDate < oldestTransaction) oldestTransaction = itemDate;
        if (!newestTransaction || itemDate > newestTransaction) newestTransaction = itemDate;
      }
    }
    
    const dataAgeDays = oldestTransaction 
      ? Math.floor((Date.now() - oldestTransaction.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const hasMinimumData = dataAgeDays >= 7;
    
    // Load spawn data from types.xml
    const typesData = await loadTypesData();
    const spawnStatsData = await getSpawnStats();
    
    // Calculate pricing recommendations
    // Based on: buy/sell ratio, volume, price trends, AND spawn rates
    const priceRecommendations = [];
    
    for (const item of itemStats.values()) {
      const totalVolume = item.purchases + item.sales;
      if (totalVolume < 3) continue; // Need at least 3 trades for recommendations
      
      const buyRatio = totalVolume > 0 ? item.purchases / totalVolume : 0.5;
      const sellRatio = totalVolume > 0 ? item.sales / totalVolume : 0.5;
      
      // Get spawn data for this item
      const spawnData = typesData.get(item.className.toLowerCase());
      const spawnAnalysis = spawnData ? analyzeSpawnVsPrice(item, spawnData) : null;
      
      let recommendation = null;
      let reason = "";
      let severity = "info"; // info, warning, critical
      let suggestedChange = 0;
      let spawnInfo = null;
      
      // Extract spawn info for display
      if (spawnData) {
        spawnInfo = {
          nominal: spawnData.nominal,
          spawnRating: spawnData.spawnRating,
          spawnScore: spawnData.spawnScore,
          category: spawnData.category,
          spawns: spawnData.spawns
        };
      }
      
      // PRIORITY 1: Check spawn-based pricing issues
      // Common items that are overpriced (spawns a lot but sells high)
      if (spawnAnalysis?.priceIssue?.type === 'overpriced_common') {
        recommendation = "overpriced_common";
        const nominal = spawnData?.nominal || 0;
        const suggestedMax = spawnAnalysis.priceIssue.suggestedMaxPrice;
        suggestedChange = suggestedMax - item.avgPrice; // Will be negative
        reason = `Overpriced for spawn rate: This item has nominal ${nominal} (${spawnData?.spawnRating}) but sells for $${item.avgPrice}. Common items shouldn't be expensive.`;
        severity = spawnAnalysis.severity;
      }
      // Rare items that are underpriced
      else if (spawnAnalysis?.priceIssue?.type === 'underpriced_rare') {
        recommendation = "underpriced_rare";
        const nominal = spawnData?.nominal || 0;
        const suggestedMin = spawnAnalysis.priceIssue.suggestedMinPrice;
        suggestedChange = suggestedMin - item.avgPrice; // Will be positive
        reason = `Underpriced for rarity: This item has nominal ${nominal} (${spawnData?.spawnRating}) but only sells for $${item.avgPrice}. Rare items should be valuable.`;
        severity = spawnAnalysis.severity;
      }
      // PRIORITY 2: High demand - mostly purchases, few sales
      else if (buyRatio > 0.75 && item.purchases >= 5) {
        suggestedChange = Math.round(item.avgPrice * 0.15);
        recommendation = "increase_buy_price";
        reason = `High demand: ${item.purchases} purchases vs ${item.sales} sales. Players want this item.`;
        severity = buyRatio > 0.9 ? "critical" : "warning";
        
        // Adjust suggestion based on spawn rate
        if (spawnData && spawnData.spawnScore >= 60) {
          // Item is common, so high demand might mean price is just right or too low
          reason += ` Note: This item spawns frequently (nominal: ${spawnData.nominal}).`;
        }
      }
      // PRIORITY 3: High supply - mostly sales, few purchases
      else if (sellRatio > 0.75 && item.sales >= 5) {
        suggestedChange = -Math.round(item.avgPrice * 0.15);
        recommendation = "decrease_sell_price";
        reason = `Oversupply: ${item.sales} sales vs ${item.purchases} purchases. Market flooded.`;
        severity = sellRatio > 0.9 ? "critical" : "warning";
        
        // Adjust severity based on spawn rate
        if (spawnData && spawnData.spawnScore >= 60) {
          reason += ` This is expected - item spawns frequently (nominal: ${spawnData.nominal}).`;
          severity = "info"; // Less severe if it's a common item
        }
      }
      // Balanced but very high volume - popular item
      else if (totalVolume >= 20 && buyRatio >= 0.4 && buyRatio <= 0.6) {
        recommendation = "balanced_high_volume";
        reason = `Healthy balance: ${item.purchases} purchases, ${item.sales} sales. Pricing seems optimal.`;
        severity = "info";
        
        if (spawnData) {
          reason += ` Spawn rating: ${spawnData.spawnRating} (nominal: ${spawnData.nominal}).`;
        }
      }
      
      if (recommendation) {
        priceRecommendations.push({
          className: item.className,
          displayName: item.displayName,
          currentAvgPrice: item.avgPrice,
          purchases: item.purchases,
          sales: item.sales,
          totalVolume,
          buyRatio: Math.round(buyRatio * 100),
          recommendation,
          reason,
          severity,
          suggestedChange,
          suggestedPrice: Math.max(1, item.avgPrice + suggestedChange),
          spawnInfo,
          priceRarityAlignment: spawnAnalysis?.priceRarityAlignment || null
        });
      }
    }
    
    // Sort recommendations by severity and volume
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    priceRecommendations.sort((a, b) => {
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.totalVolume - a.totalVolume;
    });
    
    // Calculate economy health indicators
    const netMoneyFlow = totalMoneySpent - totalMoneyEarned; // Positive = money leaving economy (purchases)
    const purchaseToSaleRatio = totalSales > 0 ? (totalPurchases / totalSales).toFixed(2) : totalPurchases;
    const avgTransactionValue = totalTransactions > 0 ? Math.round((totalMoneySpent + totalMoneyEarned) / totalTransactions) : 0;
    
    // Economy health score (0-100)
    // Based on: balance of buy/sell, activity level, diversity of items
    let economyHealth = 50; // Base score
    
    // Adjust for buy/sell balance (ideal is around 1:1)
    const ratio = totalSales > 0 ? totalPurchases / totalSales : 10;
    if (ratio >= 0.5 && ratio <= 2) economyHealth += 20;
    else if (ratio >= 0.25 && ratio <= 4) economyHealth += 10;
    else economyHealth -= 10;
    
    // Adjust for item diversity
    const itemDiversity = itemStats.size;
    if (itemDiversity >= 50) economyHealth += 15;
    else if (itemDiversity >= 20) economyHealth += 10;
    else if (itemDiversity >= 10) economyHealth += 5;
    
    // Adjust for trader participation
    if (uniqueTraders >= 10) economyHealth += 15;
    else if (uniqueTraders >= 5) economyHealth += 10;
    else if (uniqueTraders >= 2) economyHealth += 5;
    
    economyHealth = Math.min(100, Math.max(0, economyHealth));
    
    res.json({
      summary: {
        totalTransactions,
        totalPurchases,
        totalSales,
        totalMoneySpent,
        totalMoneyEarned,
        netMoneyFlow,
        uniqueTraders,
        uniqueItems: itemStats.size,
        avgTransactionValue,
        purchaseToSaleRatio: parseFloat(purchaseToSaleRatio),
        economyHealth,
        dataAgeDays,
        hasMinimumData,
        oldestTransaction: oldestTransaction?.toISOString() || null,
        newestTransaction: newestTransaction?.toISOString() || null
      },
      spawnStats: spawnStatsData,
      topItemsByVolume,
      topItemsBySpending,
      topSoldItems,
      topTraders,
      topZones,
      hourlyActivity,
      recentTransactions: latestTransactions,
      priceRecommendations: priceRecommendations.slice(0, 30),
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("Economy stats error:", err);
    res.status(500).json({ error: "Failed to generate economy stats" });
  }
});

// Get spawn data for all items or search
router.get("/spawn-data", async (req, res) => {
  try {
    const { search, category, spawnRating, limit = 100 } = req.query;
    const typesData = await loadTypesData();
    
    let items = [...typesData.values()];
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter(item => 
        item.className.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by category
    if (category) {
      items = items.filter(item => item.category === category);
    }
    
    // Filter by spawn rating
    if (spawnRating) {
      items = items.filter(item => item.spawnRating === spawnRating);
    }
    
    // Sort by nominal (highest spawners first)
    items.sort((a, b) => b.nominal - a.nominal);
    
    // Limit results
    items = items.slice(0, parseInt(limit));
    
    const stats = await getSpawnStats();
    
    res.json({
      items,
      stats,
      total: typesData.size,
      filtered: items.length
    });
  } catch (err) {
    console.error("Spawn data error:", err);
    res.status(500).json({ error: "Failed to get spawn data" });
  }
});

// Get spawn data for a specific item
router.get("/spawn-data/:className", async (req, res) => {
  try {
    const { className } = req.params;
    const typesData = await loadTypesData();
    
    const item = typesData.get(className.toLowerCase());
    
    if (!item) {
      return res.status(404).json({ error: "Item not found in types.xml" });
    }
    
    res.json(item);
  } catch (err) {
    console.error("Spawn data error:", err);
    res.status(500).json({ error: "Failed to get spawn data" });
  }
});

export default router;
