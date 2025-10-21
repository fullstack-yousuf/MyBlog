// components/Dropdown.tsx
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { Fragment } from "react";

export interface DropdownOption {
  id: string;
  name: string;
}

interface DropdownProps {
  label?: string;
  options: DropdownOption[];
  selected: DropdownOption;
  onChange: (value: DropdownOption) => void;
  widthClass?: string; // e.g. w-48, w-full
}

export const Dropdown = ({
  label,
  options,
  selected,
  onChange,
  widthClass = "w-full",
}: DropdownProps) => {
  return (
    <div className="">
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-600">
          {label}
        </label>
      )}
      <Listbox value={selected} onChange={onChange}>
        <div className={`relative ${widthClass}`}>
          <Listbox.Button className="relative cursor-default rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-10 text-left text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 sm:text-sm">
            <span className="block truncate">{selected.name}</span>
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
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option) => (
                <Listbox.Option
                  key={option.id}
                  className={({ active }) =>
                    `${active ? "bg-blue-600 text-white" : "text-gray-900"}
                    relative cursor-default select-none py-2 pl-3 pr-9`
                  }
                  value={option}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`${
                          selected ? "font-semibold" : "font-normal"
                        } block truncate`}
                      >
                        {option.name}
                      </span>
                      {selected && (
                        <span
                          className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
                            active ? "text-white" : "text-blue-600"
                          }`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};
