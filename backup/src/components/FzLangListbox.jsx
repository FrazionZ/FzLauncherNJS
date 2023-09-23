import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import FzVariable from './FzVariable'

export default function FzLangListBox(props) {

  let fzVariable = new FzVariable()

  let langCurrent = window.lang.getLangCurrent()

  const [selected, setSelected] = useState(langCurrent)

  async function setLangSelect(e){
    setSelected(e)
    fzVariable.store.set('lang', e.infos.keycode)
    initLang(e.infos.keycode).then(() => {
      props.appRouter.reloadRenderPage('/connected', () => {
        setTimeout(() => {
          props.sideRouter.showPage('/settings')
        }, 800)
      })
    })
  }

  return (
    <Listbox value={selected} onChange={(e) => {setLangSelect(e)}}>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
            <span className="block truncate">{selected.infos.display}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 z-10 max-h-60 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {window.lang.langs.map((lang, langIdx) => {
                return (
                  (
                    <Listbox.Option
                      key={langIdx}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4`
                      }
                      value={lang}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? 'font-medium' : 'font-normal'
                            }`}
                          >
                            {lang.infos.display}
                          </span>
                        </>
                      )}
                    </Listbox.Option>
                  )
                )
              })}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
  )
}
