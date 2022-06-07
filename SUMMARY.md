# Table of contents

* [Introduction](README.md)

## Product Specifications

* [Function Architecture](product-specifications/functional-architecture/core-functions/README.md)
  * [User roles](tasks-and-permissions.md)
    * [Tasks and permissions](product-specifications/user-types.md)
    * [Examples](product-specifications/user-roles/examples.md)
  * [Core functions](product-specifications/functional-architecture.md)
    * [Notify event](product-specifications/functional-architecture/core-functions/notify.md)
    * [Declare event](product-specifications/functional-architecture/core-functions/declare-an-event.md)
    * [Validate event](product-specifications/function-architecture/core-functions/validate-event.md)
    * [Register event](product-specifications/function-architecture/core-functions/register-event.md)
    * [Issue certificate](product-specifications/function-architecture/core-functions/issue-a-certificate.md)
    * [Correct record](product-specifications/functional-architecture/core-functions/function-3.md)
    * [Verify record](product-specifications/function-architecture/core-functions/verify-record.md)
    * [Vital statistics export](product-specifications/function-architecture/core-functions/vital-statistics-export.md)
  * [Support functions](product-specifications/functional-architecture/support-functions.md)
  * [Admin functions](product-specifications/functional-architecture/admin-functions.md)
* [Farajaland](product-specifications/farajaland.md)
* [Status flow](product-specifications/status-flow.md)

## Technology

* [Architecture](technology/architecture.md)
* [Standards](technology/development-standards.md)
* [APIS](technology/apis.md)
* [Interoperability](technology/interoperability.md)

## Setup

* [0. Before you start](setup/0.-before-you-start.md)
* [1. Establish team](setup/1.-establish-team.md)
* [2. Gather requirements](setup/2.-gather-requirements.md)
* [3. Installation](setup/3.-installation/README.md)
  * [3.1 Set-up a development environment](setup/3.-installation/3.1-set-up-a-development-environment/README.md)
    * [3.1.1 Install the required dependencies](setup/3.-installation/3.1-set-up-a-development-environment/3.1.1-install-the-required-dependencies.md)
    * [3.1.2 Install OpenCRVS locally](setup/3.-installation/3.1-set-up-a-development-environment/3.1.2-install-opencrvs-locally.md)
    * [3.1.3 Starting and stopping OpenCRVS](setup/3.-installation/3.1-set-up-a-development-environment/3.1.3-starting-and-stopping-opencrvs.md)
    * [3.1.4 Log in to OpenCRVS locally](setup/3.-installation/3.1-set-up-a-development-environment/3.1.4-log-in-to-opencrvs-locally.md)
  * [3.2 Set-up your own country configuration](setup/3.-installation/3.2-set-up-your-own-country-configuration/README.md)
    * [3.2.1 Fork your own country configuration repository](setup/3.-installation/3.2-set-up-your-own-country-configuration/3.2.1-fork-your-own-country-configuration-repository.md)
    * [3.2.2 Configure administrative address structure](setup/3.-installation/3.2-set-up-your-own-country-configuration/3.2.2-configure-administrative-address-structure.md)
    * [3.2.3 Import CR offices and Health facilities](setup/3.-installation/3.2-set-up-your-own-country-configuration/3.2.3-import-cr-offices-and-health-facilities.md)
    * [3.2.4 Import employees for testing or production](setup/3.-installation/3.2-set-up-your-own-country-configuration/3.2.4-import-employees-for-testing-or-production.md)
    * [3.2.5 Generate factory reset, reference data backups](setup/3.-installation/3.2-set-up-your-own-country-configuration/3.2.5-generate-factory-reset-reference-data-backups.md)
    * [3.2.6 Set-up multi language content](setup/3.-installation/3.2-set-up-your-own-country-configuration/3.2.6-set-up-multi-language-content.md)
    * [3.2.7 Configure BRN/DRN registration and interoperability](setup/3.-installation/3.2-set-up-your-own-country-configuration/3.2.7-configure-brn-drn-registration-and-interoperability.md)
    * [3.2.8 Configure health facility notifications](setup/3.-installation/3.2-set-up-your-own-country-configuration/3.2.8-configure-health-facility-notifications.md)
    * [3.2.9 Provision required settings](setup/3.-installation/3.2-set-up-your-own-country-configuration/3.2.9-provision-required-settings.md)
  * [3.3 Set-up a server-hosted environment](setup/3.-installation/3.3-set-up-a-server-hosted-environment/README.md)
    * [3.3.1 Provision your server nodes with SSH access](setup/3.-installation/3.3-set-up-a-server-hosted-environment/3.3.1-provision-your-server-nodes-with-ssh-access.md)
    * [3.3.2 Install dependencies](setup/3.-installation/3.3-set-up-a-server-hosted-environment/3.3.2-install-dependencies.md)
    * [3.3.3 Create Docker Secrets & provision an SMS gateway](setup/3.-installation/3.3-set-up-a-server-hosted-environment/3.3.3-create-docker-secrets-and-provision-an-sms-gateway.md)
    * [3.3.4 Set up an SMTP server for OpenCRVS monitoring alerts](setup/3.-installation/3.3-set-up-a-server-hosted-environment/3.3.4-set-up-an-smtp-server-for-opencrvs-monitoring-alerts.md)
    * [3.3.5 Setup DNS A records](setup/3.-installation/3.3-set-up-a-server-hosted-environment/3.3.5-setup-dns-a-records.md)
    * [3.3.6 Deploy](setup/3.-installation/3.3-set-up-a-server-hosted-environment/3.3.6-deploy.md)
* [4. Configuration](setup/4.-configuration.md)
  * [4.# Configure a certificate template](setup/4.-configuration/4.-configure-a-certificate-template.md)
* [5. Testing](setup/5.-testing.md)
* [6. Go live](setup/6.-go-live.md)
* [7. Monitoring](setup/7.-monitoring/README.md)
  * [7.# Logging](setup/7.-monitoring/7.-logging.md)

## General

* [Resources](general/resources.md)
* [Contributing](general/contributing.md)
* [Change log](general/change-log.md)
* [Roadmap](general/roadmap.md)