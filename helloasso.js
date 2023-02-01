import url from "url";
import axios from "axios";
import cron, { CronJob } from "cron";
import * as data from "./config.json" assert { type: "json" };
import { sendTicket } from "./index.js";
import Datastore from "nedb-promises";
const {
  HELLO_ASSO_CLIENT_ID,
  HELLO_ASSO_CLIENT_SECRET,
  ORGANIZATION_SLUG,
  CLIMBUP_FORM_SLUG,
} = data.default;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const db = new Datastore({ filename: "./data/date.db", autoload: true });

let accessToken = null;
let refreshToken = null;
let refreshInterval = null;
const dbDate = await db.find({}).then((doc) => {
  return doc[0].date;
}).catch(() => new Date());
let date = new Date(await dbDate);

async function getAccessToken() {
  if (accessToken) {
    return await refreshAccessToken();
  }
  console.log("test");
  const body = new url.URLSearchParams();
  body.append("client_id", HELLO_ASSO_CLIENT_ID);
  body.append("client_secret", HELLO_ASSO_CLIENT_SECRET);
  body.append("grant_type", "client_credentials");
  return await axios
    .post(`https://api.helloasso.com/oauth2/token`, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    .then((response) => {
      console.log("hey");
      accessToken = response.data.access_token;
      refreshToken = response.data.refresh_token;
      refreshInterval = response.data.expires_in;
      return accessToken;
    })
    .catch((error) => {
      throw error;
    });
}

async function refreshAccessToken() {
  const body = new url.URLSearchParams();
  body.append("client_id", HELLO_ASSO_CLIENT_ID);
  body.append("grant_type", "refresh_token");
  body.append("refresh_token", refreshToken);

  return await axios
    .post(`https://api.helloasso.com/oauth2/token`, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    .then((response) => {
      accessToken = response.data.access_token;
      refreshToken = response.data.refresh_token;
      refreshInterval = response.data.expires_in;
      return accessToken;
    })
    .catch((error) => {
      throw error;
    });
}

var helloAssoTask = async () => {
  console.log("task running");
  const token = await getAccessToken();
  const response = await axios
    .get(
      `
      https://api.helloasso.com/v5/organizations/${ORGANIZATION_SLUG}/forms/Event/${CLIMBUP_FORM_SLUG}/orders
    `,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((result) => result.data)
    .catch((error) => {
      throw error;
    });
  console.log(response.data.filter((order) => new Date(order.date) > date));
  response.data
    .filter((order) => new Date(order.date) > date)
    .forEach(async (a) => {
      const infos = await axios
        .get(`https://api.helloasso.com/v5/orders/${a.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((result) => result.data);
      // console.log(b.id);
      infos.items.forEach((item) => {
        if (item.customFields && item.customFields.length > 0) {
          const userId = item.customFields?.find(
            (field) => field.name === "Identifiant"
          )?.answer;
          sendTicket(userId);
          sleep(30000);
        }
      });
    });

  // set the new date in db
  await db.update({}, { date: new Date() }, { multi: true });
  date = new Date()
  console.log("updated");
};

export default helloAssoTask;

