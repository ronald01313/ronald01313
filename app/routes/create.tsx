import { useState } from "react";
import CreatePost from "../components/CreatePost";

export default function CreatePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    // Trigger a refresh of the parent component
    setRefreshKey(prev => prev + 1);
    
  };

  return (
    <div key={refreshKey}>
      <CreatePost onPostCreated={handlePostCreated} />
    </div>
  );
}
