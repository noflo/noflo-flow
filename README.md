# Flow Control for NoFlo
[![Build Status](https://secure.travis-ci.org/noflo/noflo-flow.png?branch=master)](https://travis-ci.org/noflo/noflo-flow) [![Dependency Status](https://gemnasium.com/noflo/noflo-flow.png)](https://gemnasium.com/noflo/noflo-flow) [![NPM version](https://badge.fury.io/js/noflo-flow.png)](http://badge.fury.io/js/noflo-flow)

This package provides utility components to control the flow within a
[NoFlo](http://noflojs.org/) program.

It qualifies as a flow control component if it allows partial data to go
to one out port versus another (or not at all).

Feel free to contribute new components and graphs! I'll try to
incorporate as soon as time allows.

## Changes

* 0.7.0 (November 17 2017)
  - Changed `All` and `Race` components to always send results as arrays, regardless whether there is one or many
