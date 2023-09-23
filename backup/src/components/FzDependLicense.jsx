import { Disclosure } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/20/solid'
import StringBuilder from 'string-builder';

export default function FzDependLicense({ license }) {

    return (
        <Disclosure>
            {({ open }) => (
                <>
                    <Disclosure.Button className="w-full flex justify-between bg-[var(--fzbg-2)] p-6 text-left text-sm font-medium text-[var(--color-2)] focus:outline-none focus-visible:ring focus-visible:[var(--color-2)] focus-visible:ring-opacity-75">
                        <span className='text-xl'>{license.package}</span>
                        <ChevronUpIcon
                            className={`${open ? '' : 'rotate-180 transform' } h-5 w-5 text-[var(--color-2)]`}
                        />
                    </Disclosure.Button>
                    <Disclosure.Panel className="p-6 text-sm bg-[var(--fzbg-1)]" dangerouslySetInnerHTML={{ __html: license.license }} />
                </>
            )}
        </Disclosure>
    )
}