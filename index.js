/*
  Polls the IPFS public gateways in gateways.json, to keep data cached and
  available to the network.
*/

"use strict";

const axios = require("axios");

const gateways = require(`./config/gateways.json`);
const pages = require(`./config/pages.json`);

const ADDR = "bitcoincash:qppngav5s88devt4ypv3vhgj643q06tctcx8fnzewp";

const BCH = require(`./src/bch`);
const bch = new BCH(ADDR);

async function cacheIPFS() {
  try {
    const hash = await bch.findHash();
    console.log(`latest IPFS hash: ${hash}`);

    if(!hash) {
      console.log(`hash could not be found. Exiting.`)
      return
    }

    // Loop through each gateway
    //for (let i = 0; i < 5; i++) {
    for(let i=0; i < gateways.gateways.length; i++) {
      const thisGateway = gateways.gateways[i];
      console.log(`Requesting content from gateway: ${thisGateway}`);

      // Loop through each piece of content
      //for (let j = 0; j < 5; j++) {
      for(let j=0; j < pages.pages.length; j++) {
        const thisPage = pages.pages[j];
        //console.log(`Requesting endpoint: ${thisPage}`)

        const url = `${thisGateway}${hash}${thisPage}`;
        console.log(`url: ${url}`);

        try {
          // Request the IPFS content from the current gateway.
          await axios({
            url: url,
            method: 'get',
            timeout: 12000 // 1 minute
          });
        } catch (err) {
          console.log(`Error returned. Skipping this url: ${url}`)
          console.log(` `)
        }
      }
    }


    const now = new Date()
    console.log(`Stopped at ${now.toLocaleString()}. Cache list complete.`)
  } catch (err) {
    console.error(`Error in cacheIPFS(): `, err);
  }
}
cacheIPFS();

setInterval(function() {
  const now = new Date()

  console.log(`Starting at ${now.toLocaleString()}. Refreshing Cache.`)
  cacheIPFS()
}, 60000 * 60) // One hour
