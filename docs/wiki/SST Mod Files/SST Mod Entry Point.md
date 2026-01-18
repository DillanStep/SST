# SST Mod Entry Point

This page documents how SST services are started inside the DayZ server runtime.

In general:

- Mission-side scheduled exporters and services are started from `5_Mission` init code.
- Feature services typically expose a `Start()` method and schedule their own poll loops.

Primary init file:

- [docs/mod/scripts/SudoServerTools_Init.md](../../mod/scripts/SudoServerTools_Init.md)

If you add a new API-backed feature, you usually:

1. Create the service class (or copy the template)
2. Call `YourService.Start()` from init

Template:

- [docs/mod/scripts/SST_ApiFeatureTemplate.md](../../mod/scripts/SST_ApiFeatureTemplate.md)
