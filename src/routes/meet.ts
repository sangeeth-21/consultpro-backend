import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

// Define the schema for the request body using Zod
const createMeetingSchema = z.object({
  startTime: z.string().min(1, { message: "Start time is required" }),
  duration: z.number().min(1, { message: "Duration must be at least 1 minute" }),
  topic: z.string().min(1, { message: "Topic is required" }),
});

// Create a new Hono app for the meeting route
const meetApp = new Hono();

// POST endpoint to create a Zoho meeting
meetApp.post(
  '/create-zoho-meeting',
  zValidator('json', createMeetingSchema, (result: any, c: any) => {
    if (!result.success) {
      return c.json({ error: result.error.issues }, 400);
    }
  }),
  async (c) => {
    try {
      const { startTime, duration, topic } = c.req.valid('json');

      // Manually set your Zoho authentication token and organization ID
      const zohoAuthToken = "1000.04795d202967bf498ec7f1c5fc7dca09.59056311459235bb4e213e93b139c66f"; // Replace with your actual Zoho auth token
      const zsoid = "60010588349"; // Replace with your Zoho Organization ID

      const requestData = {
        session: {
          topic: topic,
          agenda: "Points to get noted during meeting.",
          presenter: 60030281554, // Replace with your presenter ID
          startTime: startTime,
          duration: duration,
          timezone: "Asia/Calcutta",
          participants: [],
        },
      };

      const url = `https://meeting.zoho.in/api/v2/${zsoid}/sessions.json`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Authorization': `Zoho-oauthtoken ${zohoAuthToken}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create Zoho meeting: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        session: {
          id: string;
          topic: string;
          startTime: string;
          duration: number;
          joinLink: string;
        };
      };

      // Extract necessary data from the response
      const meetingData = {
        meetingId: data.session.id,
        topic: data.session.topic,
        startTime: data.session.startTime,
        duration: data.session.duration,
        joinLink: data.session.joinLink,
      };

      return c.json(meetingData);
    } catch (error) {
      console.error("Error creating Zoho Meeting:", error);
      return c.json({ error: "Failed to create Zoho Meeting" }, 500);
    }
  }
);

// Export the meetApp for use in index.ts
export { meetApp };