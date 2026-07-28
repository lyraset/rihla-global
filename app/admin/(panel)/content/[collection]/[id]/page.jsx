import { notFound } from 'next/navigation'
import { getCollection } from '../../../../../../lib/cms/collections.js'
import { getEntity } from '../../../../../../services/cms.js'
import { docToFormValues } from '../../../../../../lib/cms/fields.js'
import EntityForm from '../../../../../../components/admin/EntityForm.jsx'

export const dynamic = 'force-dynamic'

export default async function EntityEditPage({ params }) {
  const { collection, id } = await params
  const col = getCollection(collection)
  if (!col) notFound()

  let doc = {}
  if (id !== 'new') {
    const d = await getEntity(col.model, id)
    if (!d) notFound()
    doc = d.toJSON()
  }
  const values = docToFormValues(col.fields, doc)

  return (
    <div>
      <h1 className="mb-5 font-heading text-2xl font-bold text-navy-900">
        {id === 'new' ? `New ${col.label}` : `Edit ${col.label}`}
      </h1>
      <EntityForm
        collectionKey={collection}
        id={id}
        fields={col.fields}
        values={values}
        listHref={`/admin/content/${collection}`}
      />
    </div>
  )
}
