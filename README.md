# New Relic Browser Agent Changelog

The New Relic Browser agent (NRBA) instruments your website and provides observability into the performance and behavior of your application. This branch of the NRBA repository is used to track and maintain changelog details.

## Local Usage

### Installation

```bash
npm i
```

### Development Details

`/scripts` contains scripts called by CI to generate changelog items or normalize outputs. Modifying these scripts may affect CI outcomes.

`/src/next` contains build outputs of the CI scripts, slated for the next release.  Once the next release actually happens, `next` gets renamed to the release tag, and a new (empty) `next` folder is generated.

## Support

New Relic hosts and moderates an online forum where customers can interact with New Relic employees as well as other customers to get help and share best practices. Like all official New Relic open source projects, there's a related Community topic in the New Relic Explorers Hub. You can find this project's topic/threads here:

https://discuss.newrelic.com/c/full-stack-observability/browser

## Contribute

We encourage your contributions to improve the Browser agent! Keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. You only have to sign the CLA one time per project.

If you have any questions, or to execute our corporate CLA (which is required if your contribution is on behalf of a company), drop us an email at opensource@newrelic.com.

For more details on how best to contribute, see [CONTRIBUTING.md](CONTRIBUTING.md)

**A note about vulnerabilities**

As noted in our [security policy](https://github.com/newrelic/newrelic-browser-agent/security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the security community are important means to achieve our security goals.

If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through [HackerOne](https://hackerone.com/newrelic).

If you would like to contribute to this project, review [these guidelines](https://github.com/newrelic/newrelic-browser-agent/blob/main/CONTRIBUTING.md).

To all contributors, we thank you! Without your contribution, this project would not be what it is today. We also host [a community project page dedicated to the Browser agent](https://opensource.newrelic.com/projects/newrelic/newrelic-browser-agent).

## License

The Browser agent is licensed under the [Apache 2.0](http://apache.org/licenses/LICENSE-2.0.txt) License.

The Browser agent also uses source code from third-party libraries. Full details on which libraries are used and the terms under which they are licensed can be found in the [third-party notices document](https://github.com/newrelic/newrelic-browser-agent/blob/main/THIRD_PARTY_NOTICES.md).