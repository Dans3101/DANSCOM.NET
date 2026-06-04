import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

export const DataUsageChart = ({ data }: { data: { name: string, value: number }[] }) => {
    const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];
    
    return (
        <div className="bg-bg-card p-6 rounded-xl border border-border-custom">
            <h3 className="text-lg font-semibold mb-4">Data Usage</h3>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
