/**
 * @file SST_TradeLogger.c
 * @brief Logs Expansion Market trades to per-player JSON files.
 *
 * Records purchases and sales (from Expansion Market hooks) to $profile:SST/trades/.
 * Intended for consumption by external tooling/dashboards.
 */

class SST_TradeEventType
{
	static const string PURCHASE = "PURCHASE";
	static const string SALE = "SALE";
}

class SST_TradeEventData
{
	string timestamp;
	string eventType;           // PURCHASE or SALE
	string playerName;
	string playerId;
	string itemClassName;
	string itemDisplayName;
	int quantity;
	int price;
	string traderName;          // Display name of trader
	string traderZone;          // Market zone name
	vector traderPosition;      // Position of the trader
	vector playerPosition;      // Position of the player
}

class SST_PlayerTradeLog
{
	string playerName;
	string playerId;
	int totalPurchases;
	int totalSales;
	int totalSpent;
	int totalEarned;
	ref array<ref SST_TradeEventData> trades = new array<ref SST_TradeEventData>();
}

// Aggregates and persists trade events.
class SST_TradeLogger
{
	protected static ref SST_TradeLogger s_Instance;
	static const string TRADES_FOLDER = "$profile:SST/trades/";
	
	// Cache of loaded trade logs per player
	protected ref map<string, ref SST_PlayerTradeLog> m_TradeLogs;
	
	void SST_TradeLogger()
	{
		m_TradeLogs = new map<string, ref SST_PlayerTradeLog>();
		
		// Create trades folder
		if (!FileExist("$profile:SST"))
			MakeDirectory("$profile:SST");
		if (!FileExist(TRADES_FOLDER))
			MakeDirectory(TRADES_FOLDER);
	}
	
	static SST_TradeLogger GetInstance()
	{
		if (!s_Instance)
			s_Instance = new SST_TradeLogger();
		return s_Instance;
	}
	
	static string GetUTCTimestamp()
	{
		int year, month, day, hour, minute, second;
		GetYearMonthDayUTC(year, month, day);
		GetHourMinuteSecondUTC(hour, minute, second);
		return string.Format("%1-%2-%3T%4:%5:%6Z",
			year.ToStringLen(4),
			month.ToStringLen(2),
			day.ToStringLen(2),
			hour.ToStringLen(2),
			minute.ToStringLen(2),
			second.ToStringLen(2));
	}
	
	// Log a trade event
	void LogTrade(string eventType, PlayerBase player, string itemClassName, string itemDisplayName, int quantity, int price, string traderName, string traderZone, vector traderPosition)
	{
		if (!GetGame().IsServer())
			return;
			
		if (!player)
			return;
			
		PlayerIdentity identity = player.GetIdentity();
		if (!identity)
			return;
		
		string playerId = identity.GetPlainId();
		string playerName = identity.GetName();
		vector playerPosition = player.GetPosition();
		
		// Create trade event data
		ref SST_TradeEventData tradeData = new SST_TradeEventData();
		tradeData.timestamp = GetUTCTimestamp();
		tradeData.eventType = eventType;
		tradeData.playerName = playerName;
		tradeData.playerId = playerId;
		tradeData.itemClassName = itemClassName;
		tradeData.itemDisplayName = itemDisplayName;
		tradeData.quantity = quantity;
		tradeData.price = price;
		tradeData.traderName = traderName;
		tradeData.traderZone = traderZone;
		tradeData.traderPosition = traderPosition;
		tradeData.playerPosition = playerPosition;
		
		// Load or create player's trade log
		ref SST_PlayerTradeLog playerLog = GetOrCreatePlayerLog(playerId, playerName);
		playerLog.trades.Insert(tradeData);
		
		// Update totals
		if (eventType == SST_TradeEventType.PURCHASE)
		{
			playerLog.totalPurchases += quantity;
			playerLog.totalSpent += price;
		}
		else if (eventType == SST_TradeEventType.SALE)
		{
			playerLog.totalSales += quantity;
			playerLog.totalEarned += price;
		}
		
		// Keep only last 500 trades per player to prevent file bloat
		while (playerLog.trades.Count() > 500)
		{
			playerLog.trades.Remove(0);
		}
		
		// Save to file
		SavePlayerLog(playerId, playerLog);
		
		// Console log for debugging
		Print("[SST] TRADE " + eventType + ": " + playerName + " - " + itemDisplayName + " x" + quantity + " for " + price);
	}
	
	protected ref SST_PlayerTradeLog GetOrCreatePlayerLog(string playerId, string playerName)
	{
		// Check cache first
		if (m_TradeLogs.Contains(playerId))
			return m_TradeLogs.Get(playerId);
		
		// Try to load from file
		string filePath = TRADES_FOLDER + playerId + "_trades.json";
		ref SST_PlayerTradeLog playerLog;
		
		if (FileExist(filePath))
		{
			string errorMsg;
			if (JsonFileLoader<SST_PlayerTradeLog>.LoadFile(filePath, playerLog, errorMsg))
			{
				m_TradeLogs.Set(playerId, playerLog);
				return playerLog;
			}
		}
		
		// Create new log
		playerLog = new SST_PlayerTradeLog();
		playerLog.playerName = playerName;
		playerLog.playerId = playerId;
		playerLog.totalPurchases = 0;
		playerLog.totalSales = 0;
		playerLog.totalSpent = 0;
		playerLog.totalEarned = 0;
		m_TradeLogs.Set(playerId, playerLog);
		
		return playerLog;
	}
	
	protected void SavePlayerLog(string playerId, SST_PlayerTradeLog playerLog)
	{
		string filePath = TRADES_FOLDER + playerId + "_trades.json";
		string errorMsg;
		
		if (!JsonFileLoader<SST_PlayerTradeLog>.SaveFile(filePath, playerLog, errorMsg))
		{
			Print("[SST] ERROR: Failed to save trade log for " + playerId + ": " + errorMsg);
		}
	}
	
	// Static helper methods for easy calling
	static void LogPurchase(PlayerBase player, string itemClassName, string itemDisplayName, int quantity, int price, string traderName, string traderZone, vector traderPosition)
	{
		GetInstance().LogTrade(SST_TradeEventType.PURCHASE, player, itemClassName, itemDisplayName, quantity, price, traderName, traderZone, traderPosition);
	}
	
	static void LogSale(PlayerBase player, string itemClassName, string itemDisplayName, int quantity, int price, string traderName, string traderZone, vector traderPosition)
	{
		GetInstance().LogTrade(SST_TradeEventType.SALE, player, itemClassName, itemDisplayName, quantity, price, traderName, traderZone, traderPosition);
	}
}
