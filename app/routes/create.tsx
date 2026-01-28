import { CreatePost } from "../components/CreatePost";

export default function CreatePage() {
  const handlePostCreated = () => {
    // Component handles its own post creation
  };

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto" }}>
      <CreatePost onPostCreated={handlePostCreated} />
    </div>
  );
}
