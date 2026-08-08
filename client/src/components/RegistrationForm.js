import { useState } from 'react';

function RegistrationForm() {
    const [formData, setFormData] = useState({
        name: '',
        whatsappNumber: '',
        email: '',
        planType: 'monthly'
    });
    const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/members/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setStatus('success');
            setMessage(`Registered successfully! Amount due: ₹${data.member.amountPaid}`);
            setFormData({ name: '', whatsappNumber: '', email: '', planType: 'monthly' });

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
                    {status === 'loading' ? 'Registering...' : 'Register Now'}
                </button>
            </form>

            {message && (
                <p style={{ marginTop: '1rem', color: status === 'success' ? 'green' : 'red' }}>
                    {message}
                </p>
            )}
        </div>
    );
}

export default RegistrationForm;