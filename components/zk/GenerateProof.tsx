import { useState } from "react"
import fetch from "node-fetch"

export default function GenerateProof() {
    const [ bid, setBid ] = useState(21);
    const [ proof, setProof ] = useState({});
    const [ proofValues, setProofValues ] = useState("");
    const [ hash, setHash ] = useState("");
    return <div className="md:grid md:grid-cols-1">
        <div className="mt-12 md:mt-0">
            <div className="shadow sm:overflow-hidden sm:rounded-md">
                <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-3 sm:col-span-2">
                            <label htmlFor="bid-value" className="block text-sm font-medium text-gray-700">
                                BID value
                            </label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                        <span
                            className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                          $
                        </span>
                                <input
                                    type="number"
                                    step={1}
                                    min={20}
                                    defaultValue={bid}
                                    onChange={(e) => setBid(parseInt(e.target.value))}
                                    name="bid-value"
                                    id="bid-value"
                                    className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="21"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {!!hash &&
                    <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                        <div className="grid grid-cols-3 gap-6">
                            <div className="col-span-3 sm:col-span-2">
                                <label htmlFor="hash-after-value" className="block text-sm font-medium text-gray-700">
                                    Hash
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        defaultValue={hash}
                                        disabled={false}
                                        name="hash-after-value"
                                        id="hash-after-value"
                                        className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="21"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {
                    !!proofValues &&
                    <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                        <div className="grid grid-cols-3 gap-6">
                            <div className="col-span-3 sm:col-span-2">
                                <label htmlFor="proof-value" className="block text-sm font-medium text-gray-700">
                                    Proof Values
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        defaultValue={proofValues}
                                        disabled={false}
                                        name="proof-value"
                                        id="proof-value"
                                        className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="21"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                }
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                    <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={(e) => {
                            fetch("/api/keys", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    bidValue: bid,
                                    isReveal: false,
                                })
                            }).catch((e) => {
                                console.log(e);
                                alert(e.message)
                            }).then((res) => res?.json()).then((res) => {
                                console.log({ res })
                                setProof(res || {});
                                setHash(res?.hashAfter);
                                setProofValues(res?.proofArray ? JSON.stringify(res?.proofArray) : "");
                            })
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    </div>
}
