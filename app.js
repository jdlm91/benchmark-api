const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const supabase = require('@supabase/supabase-js');
const converter = require('jstoxml');
const cors = require('cors');
const _supabase =
  supabase.createClient(
    "SUPABASE_URL=https://zahmyhvievhhtizhdryx.supabase.co" +
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphaG15aHZpZXZoaHRpemhkcnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODgyMjQ3NDcsImV4cCI6MjAwMzgwMDc0N30.u8vi_z8XKfXRjnn9SYMPM4SwbfqhMKApial-Y5Zwreo",);

let agents = [];
let deals = [];
let annualDeals = [];
let monthDeals = [];

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

app.use(cors());
app.get("/", async (req, res) => res.send(await getData()));

async function getData() {
  let { year, month } = (await _supabase.from('dashboard').select('year,month').limit(1).single(1)).data;
  await getAgents();
  await getDeals(year, month);

  const xml = converter.toXML({ deals: { monthly: monthDeals, annual: annualDeals, year: year, month: month } });
  return xml;
}

async function getAgents() {
  agents = (await _supabase.from('agents').select('name')).data;
}

async function getDeals(year, month) {
  deals = (await _supabase.from('deals').select('agents(name),value,month').eq('year', year)).data;
  monthDeals = [];
  annualDeals = [];
  md = [];
  ad = [];
  agents.forEach(a => {
    const ad = deals.filter(d => d.agents.name === a.name);
    let yt = 0;
    let mt = 0;

    if (ad.length > 0) {
      ad.forEach(d => {
        yt += d.value;

        if (d.month === month) {
          mt += d.value;
        }
      });
    }

    annualDeals.push({ name: a.name, total: yt });
    monthDeals.push({ name: a.name, total: mt });
  });

  monthDeals.sort((a, b) => b.total - a.total);
  annualDeals.sort((a, b) => b.total - a.total);
}