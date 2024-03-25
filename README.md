# duplojs-to
[![NPM version](https://img.shields.io/npm/v/@duplojs/to)](https://www.npmjs.com/package/@duplojs/to)

DuploJSTo est un client HTTP qui facilite la communication avec une API [DuploJS](https://github.com/duplojs/duplojs). Le package intégre aussi un plugin Duplo qui permet de générer une déclaration des enrtés et des sortie de votre back-end.

## Instalation
```
npm i @duplojs/to
```

## Initialisation
```ts
// client http
const duploTo = new DuploTo({/* config */});
```

#### Config
propriétés|valeur|definition
---|---|---
prefix|`string` \| `undefined`|Définis un prefix qui sera utilisé pour chacune des request
https|`boolean` \| `undefined`|Si `true`, Cela utilisera le protocole https. Si `false`, ce sera le protocole http qui sera utilisé. Dans le cas ou il n'est pas défini, le protocole utilisé sera celui actuelle de la page.
host|`string` \| `undefined`| définis l'host des requests. Exemple : `"www.youtube.com"`, Et si la propriété n'est pas défini, la valeur par défaut, sera l'host de la page actuelle.
keyInfo|`string` \| `undefined`|La clé pour trouver l'info dans les headers. Valeur pars défaut `"info"`.



