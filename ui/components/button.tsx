import { ReactNode } from "react"


type Props = {
    type?: 'primary' | 'secondary' | 'destructive'| 'secondary-destructive',
    children: ReactNode,
    className?: string,
    onClick?: () => void,
}

const Button = ({ type = 'primary', children, onClick, className }: Props) => {


    let styles = "";

    switch(type) {
        case 'primary':
            styles = "bg-bg-brand text-text-onbrand";
            break;
        case 'secondary':
            styles = "border border-border";
            break;
        case 'destructive':
            styles = "bg-bg-danger text-text-ondanger";
            break;
        case 'secondary-destructive':
            styles = "text-text-danger border border-border-danger"
    }

    return (
        <button onClick={onClick} className={`px-2 py-1 text-body-medium rounded-medium outline-none ${styles} ${className}`}>
            {children}
        </button>
    )
}

export default Button;