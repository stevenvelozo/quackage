# No-op Command-line Command

Leverages the `pict-service-commandlineutility` which wraps the `commander`
npm module and adds simple configuration-driven management of the application.

## Application Customization

### Executing the Application [`package.json`]

You can change the globally-installed program name and the npx program name
by altering the `package.json` `bin` section:

```json
...
    "bin": {
        "run_my_program": "./source/CLI-Run.js"
    },
...
```

This configuration above means that if you are in a repository with this
package installed, you can execute `npx run_my_program` to execute the
command-line utility from any subfolder.  This works great for monorepos
and other situations where you need scoped utilities.

If you want to for some reason execute this directly, you have to do the
double dash trick:

```shell
node ./source/CLI-Run.js -- command_to_execute -p "parameter"
```

If you don't put the double dashes before the command and parameters, things
*sometimes* work but it's extremely erratic.  Using `npx` is much cleaner as
parameters aren't eaten by the shell/interpreter.


