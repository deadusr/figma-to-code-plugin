import { useCallback, useState } from "react"

export const useDisclosure = () => {
    const [show, setShow] = useState(false);

    const close = useCallback(() => setShow(false), [setShow])
    const open = useCallback(() => setShow(true), [setShow])

    return [show, open, close] as const;
}


export const useToggle = () => {
    const [show, setShow] = useState(false);

    const toggle = useCallback(() => setShow(state => !state), [])

    return [show, toggle] as const;
}