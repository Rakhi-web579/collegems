interface MissingField {
  key: string;
  label: string;
}

interface Props {
  percentage: number;
  missingFields: MissingField[];
}

const ProfileCompletionCard = ({ percentage, missingFields }: Props) => {
  const color =
    percentage >= 80 ? "#22c55e" :
    percentage >= 50 ? "#f97316" : "#ef4444";

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4 border">
      <h3 className="font-semibold text-lg mb-2">Profile Completion</h3>

      <div className="w-full bg-gray-200 rounded-full h-4 mb-1">
        <div
          className="h-4 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-sm font-medium mb-3">{percentage}% Complete</p>

      {missingFields.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-1">Missing information:</p>
          <ul className="space-y-1">
            {missingFields.map((field) => (
              <li key={field.key}
                className="text-sm text-red-500 flex items-center justify-between">
                ⚠️ {field.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionCard;