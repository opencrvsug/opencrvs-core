# Architecture



{% embed url="https://www.figma.com/file/1WohPWFe53VH7zO7yILJDx/Architecture?node-id=0:1" %}

![](<../.gitbook/assets/Application services and network diagram.png>)

### What are the key OpenSource dependencies of OpenCRVS?

The following dependencies are automatically provisioned alongside the OpenCRVS Core in [docker](https://www.docker.com/) containers.

\


![](https://static.wixstatic.com/media/93440e\_d04078ae922a4126b8e9dd3f96066505\~mv2.png/v1/fill/w\_136,h\_39,al\_c,q\_80,usm\_0.66\_1.00\_0.01/FHIR\_Foundation.webp)

**Hearth MongoDB Database layer**

In order to support configuration for limitless country scale, OpenCRVS was designed for [NoSQL](https://en.wikipedia.org/wiki/NoSQL), built on [MongoDB](https://www.mongodb.com/), and aligned to a globally recognised healthcare standard.

Massively scalable and extensible, [Hearth](https://github.com/jembi/hearth) is an OpenSource NoSQL database server built by the OpenCRVS founding member [Jembi Health Systems](https://www.jembi.org/), using interoperable [Health Level 7](https://www.hl7.org) [FHIR](https://www.hl7.org/fhir/) v4 ([ANSI](https://www.ansi.org/) Accredited, Fast Healthcare Interoperability Resources) as standard.

We innovatively extended [FHIR](https://www.hl7.org/fhir/) to support the civil registration context. Our civil registration FHIR standard can be contributed to in this [repository](https://github.com/opencrvs/opencrvs-core-fhir-templates) at Jembi.

\


![](https://static.wixstatic.com/media/93440e\_21c72b72ff3a405596448e33f80a719c\~mv2\_d\_3422\_1781\_s\_2.png/v1/fill/w\_136,h\_70,al\_c,q\_80,usm\_0.66\_1.00\_0.01/Elasticsearch-Logo-Color-V.webp)

**ElasticSearch**

ElasticSearch is used with Kibana for application and server health monitoring, along with optimisation.

The Kibana login details that we use by default are:

KIBANA\_USERNAME: **kibana@opencrvs.org** KIBANA\_PASSWORD: **test**

These details should be configured in Github Actions for deployment to a server.

De-duplication management to ensure data integrity is essential to any respectable civil registration system. A fast search engine lowers operational costs and improves the user experience for frontline staff.

OpenCRVS uses [ElasticSearch](https://www.elastic.co/), an industry standard, NoSQL document orientated, real-time de-duplication & search engine. Lightning fast, intelligent civil registration record returns are possible, even with imprecise, “fuzzy” search parameters.

\


![](https://static.wixstatic.com/media/93440e\_7ae07f5f77c6407080656fff4e0cdcd3\~mv2.jpg/v1/fill/w\_134,h\_26,al\_c,q\_80,usm\_0.66\_1.00\_0.01/influxdata-2.webp)

**InfluxData**

Hyper efficient and optimised, [Influx](https://www.influxdata.com) is a time series database for big data insights. Millisecond level query times facilitate civil registration statistical queries over months of data, disaggregated by gender, location and configurable operational and statistical parameters.

\


![](https://static.wixstatic.com/media/93440e\_bdd011d5e3744e7b84684e6789c1f5c7\~mv2.png/v1/fill/w\_136,h\_40,al\_c,q\_80,usm\_0.66\_1.00\_0.01/openhim-logo-green.webp)

**OpenHIM enterprise service bus, interoperability Layer**

The [OpenHIM (Health Information Mediator)](https://github.com/jembi/openhim-core-js) is a NodeJS enterprise service bus designed to ease interoperability between OpenCRVS and external systems such as Health & National ID. It provides external access to the system via secure APIs. OpenHIM channels and governs internal transactions, routing, orchestrating and translating requests into [FHIR](https://www.hl7.org/fhir/) between services and the database layer.

### What is inside the OpenCRVS packages?

The core of OpenCRVS is a monorepo organised using [Lerna](https://github.com/lerna/lerna). Each package reorts unit test coverage in [Jest](https://jestjs.io/). Following the [microservice](https://en.wikipedia.org/wiki/Microservices), 1 service per container model, every package is independently scalable in a single [docker](https://www.docker.com/) container.

\
\


![](https://static.wixstatic.com/media/93440e\_168a1efc9a3d4a47bc9282c5b684df6e\~mv2.png/v1/fill/w\_70,h\_70,al\_c,q\_80,usm\_0.66\_1.00\_0.01/typescript.webp) ![](https://static.wixstatic.com/media/93440e\_0e7fdde3dc404a8cbafdf70c18cedbc6\~mv2.png/v1/fill/w\_100,h\_70,al\_c,q\_80,usm\_0.66\_1.00\_0.01/hapi-logo.webp) ![](https://static.wixstatic.com/media/93440e\_65930e880f9e4efc822db3d5f3ddeb8a\~mv2.png/v1/fill/w\_90,h\_51,al\_c,q\_80,usm\_0.66\_1.00\_0.01/node.webp)



#### OpenCRVS microservice business layer packages

The OpenCRVS’ back end microservice architecture enables continuous evolution of its business requirements.

The microservices are written in [TypeScript](https://github.com/microsoft/TypeScript) (a strictly typed superset of JavaScript that compiles to JavaScript) and NodeJS using the fully documented [HapiJS](https://github.com/hapijs/hapi) framework.

Each microservice in OpenCRVS has no knowledge of other services or business requirements in the application, and each exposes it’s capabilities via [JWT](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/) secured APIs.

Microservices:

* [auth](https://github.com/opencrvs/opencrvs-core/tree/master/packages/auth) - the authentication microservice for OpenCRVS, [JWT](https://jwt.io/) token generation and management in [Redis](https://www.redislabs.com/).

⋅⋅⋅Our client applications are protected by SMS [2-Factor Authentication](https://en.wikipedia.org/wiki/Multi-factor\_authentication). Our apps and microservices utilise [OAuth best practices](https://tools.ietf.org/id/draft-ietf-oauth-jwt-bcp-02.html) for JWT tokens.

![](https://static.wixstatic.com/media/93440e\_297d9c18fc9e48e78b39e885bbfdaa13\~mv2\_d\_1200\_1204\_s\_2.png/v1/fill/w\_70,h\_70,al\_c,q\_80,usm\_0.66\_1.00\_0.01/OAuth\_svg.webp)

* [commons](https://github.com/opencrvs/opencrvs-core/tree/master/packages/commons) - a shared library package that all microservices use in order to validate JWTs
* [config](https://github.com/opencrvs/opencrvs-core/tree/master/packages/config) - an application configuration microservice to serve country configuration settings in the upcoming Beta release scheduled for June 2022
* [gateway](https://github.com/opencrvs/opencrvs-core/tree/master/packages/gateway) - the [GraphQL](https://graphql.org/) and [Apollo](https://www.apollographql.com/) API gateway for the OpenCRVS client.

\


![](https://static.wixstatic.com/media/93440e\_d1ec46ba4c2d4c1dbb6afe6b9b7143de\~mv2.png/v1/fill/w\_133,h\_40,al\_c,q\_80,usm\_0.66\_1.00\_0.01/graphql.webp)

Using [GraphQL](https://graphql.org/) allows OpenCRVS to perform much faster and more responsively in remote areas by drastically reducing the number of HTTP requests that are required to render a view in the presentation layer.⋅⋅

The OpenCRVS GraphQL Gateway is a JWT protected [Apollo](https://www.apollographql.com/) server that requests and resolves [FHIR](https://www.hl7.org/fhir/) resources from [Hearth](https://github.com/jembi/hearth) via [OpenHIM](https://github.com/jembi/openhim-core-js) into GraphQL, for easy consumption in the client applications.

* [metrics](https://github.com/opencrvs/opencrvs-core/tree/master/packages/metrics) - the civil registration metrics and analytics microservice using the [Influx](https://www.influxdata.com) time series database.
* [notification](https://github.com/opencrvs/opencrvs-core/tree/master/packages/notification) - the microservice that manages SMS communications from OpenCRVS, including content management and SMS supplier details.
* [search](https://github.com/opencrvs/opencrvs-core/tree/master/packages/search) - the search microservice for OpenCRVS using [ElasticSearch](https://www.elastic.co/)
* [user-mgnt](https://github.com/opencrvs/opencrvs-core/tree/master/packages/user-mgnt) - the user management microservice for the OpenCRVS client. User permissions and roles can be centrally managed, supporting IT organisations that conform to [ISO27001](https://www.iso.org/isoiec-27001-information-security.html) certification.
* [workflow](https://github.com/opencrvs/opencrvs-core/tree/master/packages/workflow) - the OpenCRVS business process orchestration microservice, mediating civil registration vital event status and audit updates.

#### OpenCRVS client application packages

![](https://static.wixstatic.com/media/93440e\_50ed7c9e719e44daa7ca7d3e183f4071\~mv2.png/v1/fill/w\_121,h\_55,al\_c,q\_80,usm\_0.66\_1.00\_0.01/react.webp)

* [login](https://github.com/opencrvs/opencrvs-core/tree/master/packages/login) - the login UI client built in [React](https://reactjs.org/).
* [client](https://github.com/opencrvs/opencrvs-core/tree/master/packages/client) - the OpenCRVS UI client for civil registration built in [React](https://reactjs.org/).

Client [npm](https://www.npmjs.com/) dependencies and enablers include:

* Easy build configuration with [create-react-app](https://github.com/facebook/create-react-app), [craco](https://github.com/gsoft-inc/craco), [typrescript-eslint](https://github.com/typescript-eslint/typescript-eslint)
* Multi-lingual content management support using [react-intl](https://github.com/formatjs/react-intl)
* ES6 JS component styling using [styled-components](https://styled-components.com/)
* Fully configurable, high performance form management using [formik](https://github.com/jaredpalmer/formik)
* Pure JavaScript, client side, offline PDF certificate generation using [pdfmake](http://pdfmake.org/)
* Read-only application state management using [redux](https://github.com/reduxjs/redux)
* Unit tests coverage with [Jest](https://jestjs.io/) & [Enzyme](https://airbnb.io/enzyme/) UI component tests.

\


![](https://static.wixstatic.com/media/93440e\_8452ed95c717459e86c95ed0e17378ad\~mv2.png/v1/fill/w\_136,h\_70,al\_c,q\_80,usm\_0.66\_1.00\_0.01/PWA-Progressive-Web-App-Logo.webp)

Using an Android [progressive web application](https://developers.google.com/web/progressive-web-apps) for our client app means that we can take advantage of offline functionality and native mobile features using [Workbox](https://developers.google.com/web/tools/workbox), without the [TCO](https://en.wikipedia.org/wiki/Total\_cost\_of\_ownership) overhead of maintaining multiple web and mobile codebases and respective App/Play Store releases.

In remote areas, registrars can save a configurable number of registrations offline on their mobile phone using [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB\_API).

#### OpenCRVS component library package

[components](https://github.com/opencrvs/opencrvs-core/tree/master/packages/components) - a UI component library package for the clients using [React Storybook](https://storybook.js.org/)



#### OpenCRVS performance testing packages

* [integration](https://github.com/opencrvs/opencrvs-core/tree/master/packages/integration) - performance tests for OpenCRVS using the [K6](https://k6.io/) framework.

#### What automated testing support is there?

Besides the 80% Jest unit testing coverage on opencrvs-core, we supply e2e UI test scripts using [Cypress](https://www.cypress.io/).

Because the OpenCRVS Form UI is configurable to your country, the end-to-end testing scripts are located in the [example country configuration server for Farajaland.](https://github.com/opencrvs/opencrvs-farajaland/tree/master/cypress)