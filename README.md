environment-health
==================

A dropwizard and angular application to monitor yammer metrics health checks.

Application Configuration
-------------------------
The application is configured in the file `environment-health.yml`.

Environment Configuration
-------------------------
Configure the list of environments in the JSON file `src/main/resources/app/envs/envs.json`, e.g. 

`{"environments":["TX01", "TX02"]}`

Configure the list of applications being monitored within each environment in a JSON file matching the name of the environment.  The environment files are also stored in `src/main/resources/app/envs/`. e.g.

`{"name":"TX01", "applications":[`
`    {"name":"One", "url":"http://localhost:8881/healthcheck"},`
`    {"name":"Two", "url":"http://localhost:8881/healthcheck"},`
`    {"name":"Three", "url":"http://localhost:8881/healthcheck"}`
`]}`


Note: the environment names must match exactly in the JSON and in  the name of the JSON file.
