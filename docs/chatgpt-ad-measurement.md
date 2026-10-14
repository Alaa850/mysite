# ChatGPT ad measurement

This integration uses a server-side Conversions API sender in the English TecPro99 CRM.
There is no OpenAI browser SDK, automatic advanced matching, or conversion API key in this site.

## Website behavior

- Campaign link: `utm_source=chatgpt` and `click_id={oppref}`. `oppref` is a reserved query parameter in Ads Manager; use `click_id` for the macro.
- Optional visitor consent is separate from required permission to contact the customer about a repair.
- Consent is stored for up to 180 days; click context expires after 30 days.
- Approved attribution survives navigation from an iPhone landing page to the request form.
- The request's existing `pageUrl` field carries only bounded attribution fields and the consent marker.
- Declining still permits request submission and clears stored ad context. No customer contact fields are read by the measurement helper.
- English, Spanish, Arabic and Russian labels are included.

## Outcomes

- `lead_created`: CRM confirmed a saved request.
- `appointment_scheduled`: staff recorded a reservation.
- `order_created`: linked repair was issued and actually fully paid. Unpaid debt and deposit-only repairs do not qualify.

Requests, reservations and repairs are different funnel stages. Their sum is not a unique customer count.
The CRM owner report counts unique paying customers internally and does not transmit customer IDs.
Native Ads Manager click attribution may differ from local totals; events require valid click references and consent.

The campaign remains paused until launch is separately approved. This change does not add the unpublished AI chat.
