/**
 * WhatsApp Cloud API Wrapper for Zero-Cost Notification Dispatch
 * Uses the Meta Graph API which provides 1,000 free service templates per month.
 */

const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0';

export async function dispatchWorkerViaWhatsApp(workerPhone, complaintData) {
    // In a real environment, these would be securely fetched or passed from the Edge Function
    const token = import.meta.env.VITE_WHATSAPP_TOKEN || 'DUMMY_TOKEN';
    const phoneId = import.meta.env.VITE_WHATSAPP_PHONE_ID || 'DUMMY_PHONE_ID';

    if (!workerPhone || !complaintData) {
        console.error("Missing worker phone or complaint data for WhatsApp dispatch.");
        return false;
    }

    const payload = {
        messaging_product: "whatsapp",
        to: workerPhone.replace('+', ''), // Meta requires numbers without '+'
        type: "template",
        template: {
            name: "new_dispatch_alert", // This must be a pre-appproved template in Meta Dashboard
            language: { code: "en_US" },
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: complaintData.tracking_id },
                        { type: "text", text: complaintData.issue_type.replace('_', ' ') },
                        { type: "text", text: complaintData.priority.toUpperCase() },
                    ]
                }
            ]
        }
    };

    try {
        const res = await fetch(`${WHATSAPP_API_URL}/${phoneId}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
            console.log(`WhatsApp dispatch sent to ${workerPhone}`, data);
            return true;
        } else {
            console.error("WhatsApp API Error:", data);
            return false;
        }
    } catch (err) {
        console.error("Failed to execute WhatsApp dispatch:", err);
        return false;
    }
}
