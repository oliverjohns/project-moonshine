/* This example requires Tailwind CSS v2.0+ */
import { PaperClipIcon } from "@heroicons/react/solid";

export default function Surveys() {
  const surveys = [
    { name: "survey 1", responded: "18/20" },
    { name: "survey 2", responded: "12/20" },
    { name: "survey 3", responded: "15/20" },
    { name: "survey 4", responded: "11/20" },
    { name: "survey 5", responded: "19/20" },
  ];
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Surveys</h3>
        <div className={`pt-5 sm:grid sm:grid-cols-3 sm:gap-4 `}>
          <dt className="text-sm font-medium text-gray-500">Column 1</dt>
          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            Column 2
          </dd>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          {surveys.map((survey, i) => (
            <div
              className={`${
                i % 2 === 0 ? "bg-gray-50" : "bg-white"
              } px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}
              key={i}
            >
              <dt className="text-sm font-medium text-gray-500">
                {survey.name}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {survey.responded}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
