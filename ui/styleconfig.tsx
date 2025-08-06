import Button from "./components/button"
import Checkbox from "./components/checkbox"
import Icon from "./components/icon"
import { onImportTailwindColors, onRemoveTailwindColors, useConfigsStore } from "./main"
import { useDisclosure, useToggle } from "./utils/hooks"

const StyleConfig = () => {

    const [show, toggle] = useToggle();

    const { tailwindColorPaleteId } = useConfigsStore()
    const paleteCreated = tailwindColorPaleteId !== null;

    const onImport = () => {
        onImportTailwindColors();
    }

    const onRemove = () => {
        onRemoveTailwindColors();
    }




    return (

        <>
            <div className="group h-5 pl-3 pr-2 py-1 flex justify-between items-center relative">
                <button onClick={toggle} className="z-20 absolute left-0 top-0 bottom-0 flex items-center justify-center w-3 h-full outline-none">
                    <Icon className={`text-icon-tertiary hidden! group-hover:block! ${show ? "" : "-rotate-90"} `} icon="chevron.down.16" />
                </button>
                <span className="text-body-medium text-text">Style configuration</span>
            </div>


            {show
                ? <div>
                    <div className="pl-3 pr-2 py-2">
                        <Checkbox onCLick={() => { }} name="Disable default Tailwind pallete" />
                    </div>

                    <div className="pl-3 pr-2 py-2">
                        <Checkbox active onCLick={() => { }} name="Generate pallet from Figma variables" />
                    </div>

                    <div className="pl-3 pr-2 py-2">
                        {paleteCreated
                            ? <Button onClick={onRemove} className="w-full" type='secondary-destructive' >Remove Tailwind pallete from project</Button>
                            : <Button onClick={onImport} className="w-full" type='secondary' >Load Tailwind pallete to project</Button>
                        }

                    </div>
                </div>
                : null}

        </>

    )
}


export default StyleConfig;