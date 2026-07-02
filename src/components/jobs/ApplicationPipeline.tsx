interface Stage {
    key: string;
    label: string;
    description: string;
    icon: string;
}

const STAGES: Stage[] = [
    {
        key: "PENDING",
        label: "Applied",
        description: "Application submitted successfully",
        icon: "📨",
    },
    {
        key: "REVIEWED",
        label: "Under Review",
        description: "Company is reviewing your application",
        icon: "👀",
    },
    {
        key: "APPROVED",
        label: "Approved",
        description: "Congratulations! You've been approved",
        icon: "✅",
    },
];

const STATUS_ORDER: Record<string, number> = {
    PENDING: 0,
    REVIEWED: 1,
    APPROVED: 2,
    REJECTED: 2, // maps to final position but shows red
};

interface Props {
    status: string;
}

export default function ApplicationPipeline({ status }: Props) {
    const currentIndex = STATUS_ORDER[status] ?? 0;
    const isRejected = status === "REJECTED";

    return (
        <div className="mt-4">
            <div className="flex items-start gap-0">
                {STAGES.map((stage, i) => {
                    const isRejectedFinal = isRejected && i === 2;
                    const isDone = !isRejected
                        ? i < currentIndex
                        : i < 2
                            ? i < currentIndex
                            : false;
                    const isActive =
                        isRejectedFinal ? true : !isRejected && i === currentIndex;
                    const isPending = !isDone && !isActive;

                    return (
                        <div key={stage.key} className="flex items-start flex-1">
                            {/* Step */}
                            <div className="flex flex-col items-center">
                                {/* Circle */}
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${isRejectedFinal
                                            ? "bg-red-500 border-red-500 text-white"
                                            : isDone
                                                ? "bg-teal-600 border-teal-600 text-white"
                                                : isActive
                                                    ? "bg-white border-teal-600 text-teal-600 ring-4 ring-teal-100"
                                                    : "bg-white border-gray-200 text-gray-300"
                                        }`}
                                >
                                    {isRejectedFinal ? "✕" : isDone ? "✓" : stage.icon}
                                </div>
                                {/* Label */}
                                <p
                                    className={`text-xs font-medium mt-1.5 text-center w-16 leading-tight ${isRejectedFinal
                                            ? "text-red-600"
                                            : isActive
                                                ? "text-teal-700"
                                                : isDone
                                                    ? "text-gray-700"
                                                    : "text-gray-300"
                                        }`}
                                >
                                    {isRejectedFinal ? "Rejected" : stage.label}
                                </p>
                            </div>

                            {/* Connector line */}
                            {i < STAGES.length - 1 && (
                                <div className="flex-1 h-0.5 mt-4 mx-1">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${i < currentIndex && !isRejected
                                                ? "bg-teal-600"
                                                : "bg-gray-200"
                                            }`}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Status description */}
            <p className="text-xs text-gray-400 mt-3">
                {isRejected
                    ? "Your application was not selected this time. Keep applying!"
                    : STAGES[currentIndex]?.description}
            </p>
        </div>
    );
}
