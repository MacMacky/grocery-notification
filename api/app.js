import express from "express";
import cors from "cors";
import { API_KEY, SUBSCRIBER_ID, EMAIL, PORT } from "./config.js";
import { Novu } from "@novu/node";

const novu = new Novu(API_KEY);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/grocery-schedule', async (req, res) => {
  const { scheduledGroceryDate, groceryItems } = req.body;
  try {
    // sendAt - 9 am on the `scheduledGroceryDate`
    const sendAt = new Date(new Date(scheduledGroceryDate).setHours(9, 0, 0, 0)).toISOString();

    await novu.trigger('grocery-notification', {
      to: {
        subscriberId: SUBSCRIBER_ID,
        email: EMAIL
      },
      payload: {
        sendAt,
        date: new Date(scheduledGroceryDate).toISOString(),
        groceryItems
      }
    });
    res.status(200).send({ message: "Grocery Reminder Scheduled." })
  } catch (e) {
    console.log(e);
    res.status(500).send({
      message: 'Something went wrong, when scheduling the grocery reminder.'
    })
  }
});

app.listen(PORT, () => {
  console.log(`server listening at port ${PORT}`);
});
