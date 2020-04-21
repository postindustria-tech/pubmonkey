title: make sure GAM order is created according to the documentation


# Motivation

Create GAM orders in a predictable and conventional manner, according to the principle of least astonishment. 

# Background

There are detailed steps and a video describing GAM order creation here: http://prebid.org/adops/step-by-step.html
We need to make sure we follow this guide in terms of:
- [ ] making a creative of size 1x1 to serve any size
- [ ] referencing the same creatives in all line items within the order
- [ ] a creative per ad unit

# Objective

Check our automation that it is following the same process as described in the docs and specifically the above points.