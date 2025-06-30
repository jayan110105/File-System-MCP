import HomeClient from '@/components/HomeClient'
import { getFilesAction } from './actions';

export default async function Home() {
  const initialData = await getFilesAction();
  
  return <HomeClient initialFiles={initialData.files} initialBaseDirectory={initialData.uploadDirectory} />;
}
