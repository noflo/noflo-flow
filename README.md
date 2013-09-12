# Flow Control for NoFlo
[![Build Status](https://secure.travis-ci.org/noflo/noflo-flow.png?branch=master)](https://travis-ci.org/noflo/noflo-flow) [![Dependency Status](https://gemnasium.com/noflo/noflo-flow.png)](https://gemnasium.com/noflo/noflo-flow) [![NPM version](https://badge.fury.io/js/noflo-flow.png)](http://badge.fury.io/js/noflo-flow)

This package provides utility components to control the flow within a
[NoFlo](http://noflojs.org/) program.

It qualifies as a flow control component if it allows partial data to go
to one out port versus another (or not at all).

Feel free to contribute new components and graphs! I'll try to
incorporate as soon as time allows.

## Usage

### flow/Floodgate

Take in some IPs and cache them until it has been told which out-port to flush
them.

* In-port IN: the IPs to receive and cache
* In-port PORT: the port index of the out-port to flush the IPs
* Out-port OUT: an ArrayPort directing the release of IPs

### flow/TrafficLight

Either pass through IPs or cache them until told ready

* In-port IN: the IPs to receive and cache
* In-port STOP: `0` to stop and cache IPs and `1` to pass through
* In-port READY: send any IP to flush the cache
* Out-port OUT: out comes the IPs
