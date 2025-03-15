import React from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: "amber" | "blue" | "red" | "green" | "purple";
  trend?: {
    value: string;
    isPositive: boolean;
  };
  detail?: string;
  percentage?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  detail,
  percentage = 0,
}) => {
  const colorClasses = {
    amber: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      progress: "bg-amber-500",
    },
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      progress: "bg-blue-500",
    },
    red: {
      bg: "bg-red-100",
      text: "text-red-600",
      progress: "bg-red-500",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-600",
      progress: "bg-green-500",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      progress: "bg-purple-500",
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-stone-500">{title}</h3>
          <p className="text-3xl font-bold text-stone-800 mt-1">{value}</p>
        </div>
        <div className={`${colorClasses[color].bg} p-3 rounded-md`}>
          <div className={colorClasses[color].text}>{icon}</div>
        </div>
      </div>

      {(detail || trend) && (
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            {detail && <span className="text-stone-500">{detail}</span>}
            {trend && (
              <span
                className={`${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                } font-medium`}
              >
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full mt-2">
            <div
              className={`h-full ${colorClasses[color].progress} rounded-full`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
