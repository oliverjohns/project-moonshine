/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { BellIcon, MenuIcon, XIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { unstable_getServerSession } from "next-auth";

const user = {
  name: "Tom Cook",
  email: "tom@example.com",
  imageUrl:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Header(children: any) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const navigation = [
    {
      name: "Login",
      href: "/",
      current: false,
      show: !session,
      onClick: () => signIn(),
    },
    { name: "Home", href: "/home", current: false, show: true },
    { name: "Chat", href: "/chat", current: false, show: true },
    // { name: "My surveys", href: "/surveys", current: false, show: true },
    // { name: "Create survey", href: "/create", current: false, show: true },
  ];
  const userNavigation = [
    {
      name: "Your Profile",
      onClick: () => router.push("profile"),
    },
    {
      name: "Settings",
      onClick: () => router.push("settings"),
    },
    {
      name: "Sign out",
      onClick: async () => {
        await signOut();
        await signIn();
      },
    },
  ];
  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-100">
        <body class="h-full">
        ```
      */}
      <div className="min-h-full">
        <Disclosure as="nav" className="bg-gray-100">
          {({ open }) => (
            <>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div
                        className="h-8 w-8 relative"
                        onClick={() => router.push("/home")}
                      >
                        <Image src="/logo.svg" alt="Workflow" layout="fill" />
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <div className="ml-10 flex items-baseline space-x-4">
                        {navigation
                          .filter((nav) => nav.show)
                          .map((item) => (
                            <Link key={item.name} href={item.href}>
                              <a
                                onClick={() => item.onClick && item.onClick()}
                                className={classNames(
                                  item.href === router.asPath
                                    ? "bg-violet-500 text-white"
                                    : "text-gray-900 hover:bg-violet-400 hover:text-white",
                                  "px-3 py-2 rounded-md text-sm font-medium"
                                )}
                                aria-current={item.current ? "page" : undefined}
                              >
                                {item.name}
                              </a>
                            </Link>
                          ))}
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-4 flex items-center md:ml-6">
                      {/* Profile dropdown */}
                      <Menu as="div" className="ml-3 relative">
                        <div>
                          <Menu.Button className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                            <span className="sr-only">Open user menu</span>
                            {session?.user?.image && (
                              <div className="h-8 w-8 relative">
                                <Image
                                  className="rounded-full"
                                  layout="fill"
                                  src={session.user.image}
                                  alt=""
                                />
                              </div>
                            )}
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <a
                                    onClick={item.onClick}
                                    className={classNames(
                                      active ? "bg-gray-100" : "",
                                      "block px-4 py-2 text-sm text-gray-700"
                                    )}
                                  >
                                    {item.name}
                                  </a>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  </div>
                  <div className="-mr-2 flex md:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="bg-violet-500 inline-flex items-center justify-center p-2 rounded-md text-slate-200 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <MenuIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  {navigation
                    .filter((item) => item.show)
                    .map((item) => (
                      <Disclosure.Button
                        onClick={() => item.onClick && item.onClick()}
                        key={item.name}
                        as="a"
                        href={item.href}
                        className={classNames(
                          item.current
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white",
                          "block px-3 py-2 rounded-md text-base font-medium"
                        )}
                        aria-current={item.current ? "page" : undefined}
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                </div>
                {session?.user && (
                  <div className="pt-4 pb-3 border-t border-gray-700">
                    <div className="flex items-center px-5">
                      <div className="flex-shrink-0">
                        {session?.user?.image && (
                          <div className="h-8 w-8 relative">
                            <Image
                              className="rounded-full"
                              layout="fill"
                              src={session.user.image}
                              alt=""
                            />
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium leading-none text-gray-500">
                          {session.user.name}
                        </div>
                        <div className="text-sm font-medium leading-none text-gray-400">
                          {session.user.email}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 px-2 space-y-1">
                      {userNavigation.map((item) => (
                        <Disclosure.Button
                          key={item.name}
                          as="a"
                          onClick={item.onClick}
                          className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                        >
                          {item.name}
                        </Disclosure.Button>
                      ))}
                    </div>
                  </div>
                )}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children.children}
          </div>
        </main>
      </div>
    </>
  );
}
