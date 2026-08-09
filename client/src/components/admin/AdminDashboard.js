import { useState, useEffect } from 'react';
import MediaUpload from './MediaUpload';

function AdminDashboard({ token, onLogout }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/members`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Could not fetch members');
            }

            const data = await response.json();
            setMembers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (endDate) => {
        const now = new Date();
        const end = new Date(endDate);
        const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) return { label: 'Expired', color: '#ffcccc' };
        if (daysLeft <= 3) return { label: `Due in ${daysLeft} day(s)`, color: '#fff3cd' };
        return { label: 'Active', color: '#d4edda' };
    };

    if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading members...</p>;
    if (error) return <p style={{ textAlign: 'center', marginTop: '2rem', color: 'red' }}>{error}</p>;

    return (
        <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Arrow Fitness — Admin Dashboard</h2>
                <button onClick={onLogout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                    Logout
                </button>
            </div>

            <MediaUpload token={token} onUploadSuccess={fetchMembers} />

            <h3>Members ({members.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                        <th style={{ padding: '0.5rem' }}>Name</th>
                        <th style={{ padding: '0.5rem' }}>WhatsApp</th>
                        <th style={{ padding: '0.5rem' }}>Plan</th>
                        <th style={{ padding: '0.5rem' }}>End Date</th>
                        <th style={{ padding: '0.5rem' }}>Payment</th>
                        <th style={{ padding: '0.5rem' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map((member) => {
                        const status = getStatusInfo(member.endDate);
                        return (
                            <tr key={member._id} style={{ backgroundColor: status.color, borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '0.5rem' }}>{member.name}</td>
                                <td style={{ padding: '0.5rem' }}>{member.whatsappNumber}</td>
                                <td style={{ padding: '0.5rem' }}>{member.planType}</td>
                                <td style={{ padding: '0.5rem' }}>{new Date(member.endDate).toLocaleDateString()}</td>
                                <td style={{ padding: '0.5rem' }}>{member.paymentStatus}</td>
                                <td style={{ padding: '0.5rem' }}>{status.label}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default AdminDashboard;