import * as amqp from "amqplib/callback_api";
import * as dotenv from "dotenv";
dotenv.config();

const USERNAME: string = process.env.USERNAME ?? "guest";
const PASSWORD: string = encodeURIComponent(process.env.PASSWORD ?? "password");
const QUEUE_HOST: string | undefined = process.env.QUEUE_HOST;
const PORT: number = parseInt(process.env.PORT ?? "5672", 10);
const RABBITMQ_QUEUE: string = process.env.RABBITMQ_QUEUE ?? "Queue";
const API_HOST: string | undefined = process.env.API_HOST;

async function sendDatatoAPI(data: any, queue: string) {
  //API QUEUE DATA
  let apiUrl: string = "";

  switch (queue) {
    case "driving":
      apiUrl = `http://${API_HOST}/drivings`;
      break;
    case "travel":
      apiUrl = `http://${API_HOST}/travels`;
      break;
    case "geolocation":
      apiUrl = `http://${API_HOST}/geolocation`;
      break;
    case "crash":
      apiUrl = `http://${API_HOST}/crashes`;
      break;
    
    default:
      break;
  }

  const requestData = {
    body: JSON.stringify(data),
  };

  console.log(requestData.body)

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: requestData.body,
  });

  console.log('API DATA RESPONSE: ',response);
}

async function connect() {
  try {
    console.log("Connecting to RabbitMQ to Host: ", QUEUE_HOST);
    console.log("API Host: ", API_HOST);
    const url = `amqp://${USERNAME}:${PASSWORD}@${QUEUE_HOST}:${PORT}`;
    amqp.connect(url, (err: any, conn: amqp.Connection) => {
      console.log("Connecting to RabbitMQ", url);
      if (err) throw new Error(err);

      conn.createChannel((errChanel: any, channel: amqp.Channel) => {
        if (errChanel) throw new Error(errChanel);

        channel.assertQueue(RABBITMQ_QUEUE, {durable:true, arguments:{"x-queue-type":"quorum"}});

        channel.consume(RABBITMQ_QUEUE, async (data: amqp.Message | null) => {
          if (data?.content !== undefined) {
            const parsedContent: any = JSON.parse(data.content.toString());
            const queue: string = parsedContent.event.split('.')[0];

            console.log("order:processed:", parsedContent);
            await sendDatatoAPI(parsedContent, queue);
            channel.ack(data);
          }
        });
      });
    });
  } catch (err: any) {
    throw new Error(err);
  }
}

connect();