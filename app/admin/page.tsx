export default function AdminPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        This is a protected admin page. Only authenticated users can access this.
      </p>
    </div>
  )
}
