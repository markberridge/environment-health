ODO:

* Issue with last updated date - it's blank on toggling view until next update
* Externalize css
* move to minimize safe injection

Done:

* Externalise urls 
* Added separate CSS file to allow externalizing 
* Splitted out two separate views on two separate routes
* Moved polling into service that starts on app startup and broadcasts updates to different views 
* Moved services into separate file
* Added the ability to select environments in compact view
* Improve modal view
* Modal now dynamically updates through subscriptions to update events.
* Added more healthchecks to App 4 on TestEnv TX01 for testing.
* Fixed issue with incorrectly showing times and moving from error to warning status.

