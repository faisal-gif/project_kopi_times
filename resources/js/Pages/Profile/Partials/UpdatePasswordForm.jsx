// Ubah bagian ini (di baris paling bawah form):
<div className="flex items-center gap-4 mt-6 border-t border-base-200 pt-6">
    <button disabled={processing} className="btn btn-primary btn-sm">
        Update Password
    </button>

    <Transition
        show={recentlySuccessful}
        enter="transition ease-in-out duration-300"
        enterFrom="opacity-0 translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in-out duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
    >
        <p className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-md">
            Password diperbarui.
        </p>
    </Transition>
</div>