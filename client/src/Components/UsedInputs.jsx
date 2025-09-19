export const Message = ({ label, placeholder, name, register }) => {
    return (
        <div className="text-sm w-full">
            <label className="text-border font-semibold">{label}</label>
            <textarea
                className="w-full h-40 mt-2 p-6 bg-main border border-border rounded "
                placeholder={placeholder}
                {...register}
                name={name}
            ></textarea>
        </div>
    );
};

export const Select = ({ label, options, register, name }) => {
    return (
        <>
            <label className="text-border font-semibold">{label}</label>
            <select 
                className="w-full mt-2 px-6 py-4 text-text bg-main border border-border rounded" 
                {...register}
                name={name}
            >
                {options.map((o, i) => (
                    <option key={i} value={o.value}>
                        {o.title}
                    </option>
                ))}
            </select>
        </>
    )
}

export const Input = ({
    label,
    placeholder,
    type = "text",
    bg = false,
    register,
    name,
    value,
    onChange,
    right = null, // 👈 NEW: slot icon/nút bên phải
}) => {
    return (
        <div className="text-sm w-full">
            {label && <label className="text-border font-semibold">{label}</label>}

            {/* relative CHỈ bọc input để icon canh giữa đúng */}
            <div className="relative mt-2">
                <input
                    name={name}
                    value={value}
                    onChange={onChange}
                    {...register}
                    type={type}
                    placeholder={placeholder}
                    className={`w-full text-sm p-4 ${right ? "pr-12" : ""}
            border border-border rounded text-white
            ${bg ? "bg-main" : "bg-dry"}`}
                />

                {right && (
                    // căn giữa icon theo chiều cao input
                    <div className="absolute inset-y-0 right-3 flex items-center">
                        {right}
                    </div>
                )}
            </div>
        </div>
    );
};
