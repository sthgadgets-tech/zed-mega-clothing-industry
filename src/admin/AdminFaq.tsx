import { AdminPageHeader, AdminSaveBar, useAdmin } from './AdminLayout'
import { EntryEditor } from './AdminHomepageEditor'

export function AdminFaq() {
  const { content, updateContent } = useAdmin()
  return <>
    <AdminPageHeader eyebrow="CONTENT LIBRARY" title="FAQs & blog" description="Manage FAQ demo entries. Blog publishing is reserved for the production CMS integration." />
    <EntryEditor label="Frequently asked questions" entries={content.faq} onChange={(faq) => updateContent({ ...content, faq })} showBodyLabel="Answer" />
    <section className="admin-panel admin-editor-group admin-coming-soon"><div className="admin-panel-heading"><div><h2>Blog articles</h2><p>Article creation, scheduling, and publishing will be connected to the production content database.</p></div><span className="admin-coming-badge">Not configured</span></div></section>
    <AdminSaveBar />
  </>
}
