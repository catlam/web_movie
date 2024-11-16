import React, { useState } from 'react';
import SideBar from './SideBar';

import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Để chuyển hướng người dùng

const PlanSelect = () => {
    const [selectedPlan, setSelectedPlan] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Hàm để xử lý khi người dùng chọn gói dịch vụ
    const handlePlanSelection = async () => {
        if (!selectedPlan) {
            alert('Please select a plan!');
            return;
        }

        setLoading(true);

        try {
            // Gửi yêu cầu cập nhật gói dịch vụ cho người dùng
            const response = await axios.post('/api/select-plan', { plan: selectedPlan });

            if (response.status === 200) {
                alert('Plan selected successfully!');
                navigate('/dashboard'); 
            }
        } catch (error) {
            alert('Error selecting plan. Please try again.');
        }

        setLoading(false);
    };

    return (
        <SideBar>
            <div className='flex flex-col gap-6'>
                <h2 className="text-xl font-bold">Select Your Plan</h2>
                
                {/* Các Button cột */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-5">
                    {/* Gói Premium */}
                    <button
                        onClick={() => setSelectedPlan('premium')}
                        className={`flex flex-col items-center justify-center border p-6 rounded-lg ${selectedPlan === 'premium' ? 'bg-subMain text-white' : 'bg-white text-main'} hover:bg-subMain hover:text-white transition duration-200`}
                    >
                        <div className="text-lg font-medium">$19.99/month</div>
                        <div className="bg-subMain px-8 py-3 rounded font-medium text-sm sm:text-base">Premium</div>
                    </button>

                    {/* Gói Basic */}
                    <button
                        onClick={() => setSelectedPlan('basic')}
                        className={`flex flex-col items-center justify-center border p-6 rounded-lg ${selectedPlan === 'basic' ? 'bg-subMain text-white' : 'bg-white text-main'} hover:bg-subMain hover:text-white transition duration-200`}
                    >
                        <div className="text-lg font-medium">$9.99/month</div>
                        <div className="bg-subMain px-8 py-3 rounded font-medium text-sm sm:text-base">Basic</div>
                    </button>

                    {/* Gói Standard */}
                    <button
                        onClick={() => setSelectedPlan('standard')}
                        className={`flex flex-col items-center justify-center border p-6 rounded-lg ${selectedPlan === 'standard' ? 'bg-subMain text-white' : 'bg-white text-main'} hover:bg-subMain hover:text-white transition duration-200`}
                    >
                        <div className="text-lg font-medium">$14.99/month</div>
                        <div className="bg-subMain px-8 py-3 rounded font-medium text-sm sm:text-base">Standard</div>
                    </button>
                </div>

                {/* Nút Confirm Plan */}
                <button
                    className="bg-main font-medium transition hover:bg-subMain border border-subMain text-white py-3 px-6 rounded w-full sm:w-auto"
                    onClick={handlePlanSelection} disabled={loading}
                >
                    {loading ? 'Processing...' : 'Confirm Plan'}
                </button>
            </div>
        </SideBar>
    );
};

export default PlanSelect;
