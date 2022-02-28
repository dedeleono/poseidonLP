import React, {FC} from "react";
import CountUp from "react-countup";

interface CountUpValueProps {
    value: number;
    prefix?: string;
    showCents?: boolean;
    className?: string;
    props?: any;
}

const CountUpValue: FC<CountUpValueProps> = (
    {value,showCents = true,className,prefix = '', props}
) => {
    return (
        <CountUp
            end={value}
            duration={0.5}
            separator=","
            decimals={showCents ? 2 : 0}
            decimal="."
            prefix={prefix}
            preserveValue
            className={className}
            {...props}
        />
    );
}

export default CountUpValue;
