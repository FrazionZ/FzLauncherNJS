export default function CheckIcon(props) {

    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <circle cx={12} cy={12} r={12} fill="#311903" opacity="0.2" />
            <path
                d="M7 13l3 3 7-7"
                stroke="#311903"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )

}