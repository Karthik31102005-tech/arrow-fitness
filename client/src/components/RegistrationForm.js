import { useState } from 'react';

function RegistrationForm() {
    const [formData, setFormData] = useState({
        name: '',
        whatsappNumber: '',
        email: '',
        planType: 'monthly'
    });
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');

    const planPrices = {
        monthly: 1000,
        '3month': 3000,
        '6month': 4500,
        '12month': 8000
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const totalAmount = planPrices[formData.planType] + 1000; // plan + joining fee

            // Step 1: Create Razorpay order via backend
            const orderResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/payments/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: totalAmount })
            });

            const orderData = await orderResponse.json();

            if (!orderResponse.ok) {
                throw new Error(orderData.error || 'Could not create payment order');
            }

            // Step 2: Open Razorpay checkout popup
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Arrow Fitness',
                description: `${formData.planType} membership registration`,
                order_id: orderData.orderId,
                handler: async function (response) {
                    // Step 3: Payment successful on frontend, now verify + save on backend
                    setStatus('loading');
                    setMessage('Verifying payment...');

                    try {
                        const verifyResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/payments/verify`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                memberData: formData
                            })
                        });

                        const verifyData = await verifyResponse.json();

                        if (!verifyResponse.ok) {
                            throw new Error(verifyData.error || 'Payment verification failed');
                        }

                        setStatus('success');
                        setMessage(`Registration complete! Welcome to Arrow Fitness.`);
                        setFormData({ name: '', whatsappNumber: '', email: '', planType: 'monthly' });

                    } catch (err) {
                        setStatus('error');
                        setMessage(err.message);
                    }
                },
                prefill: {
                    name: formData.name,
                    contact: formData.whatsappNumber,
                    email: formData.email
                },
                theme: {
                    color: '#ff6600'
                },
                modal: {
                    ondismiss: function () {
                        setStatus(null);
                        setMessage('Payment cancelled.');
                    }
                }
            };

            const razorpayCheckout = new window.Razorpay(options);
            razorpayCheckout.open();

        } catch (err) {
            setStatus('error');
            setMessage(err.message);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Join Arrow Fitness</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label>WhatsApp Number</label>
                    <input
                        type="tel"
                        name="whatsappNumber"
                        value={formData.whatsappNumber}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{10}"
                        placeholder="10-digit number"
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label>Email (optional)</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label>Select Plan</label>
                    <select
                        name="planType"
                        value={formData.planType}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    >
                        <option value="monthly">Monthly - ₹1000</option>
                        <option value="3month">3 Months - ₹3000</option>
                        <option value="6month">6 Months - ₹4500</option>
                        <option value="12month">12 Months - ₹8000</option>
                    </select>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#666' }}>
                    + ₹1000 new joining fee applies for first-time registration
                </p>

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#ff6600', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {status === 'loading' ? 'Processing...' : 'Register & Pay'}
                </button>
            </form>

            {message && (
                <p style={{ marginTop: '1rem', color: status === 'success' ? 'green' : status === 'error' ? 'red' : '#333' }}>
                    {message}
                </p>
            )}
        </div>
    );
}

export default RegistrationForm;