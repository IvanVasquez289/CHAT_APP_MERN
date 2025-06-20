import { useRef, useState } from "react"
import { useChatStore } from "../store/useChatStore"
import  { Image, Send, X } from "lucide-react"
import toast from "react-hot-toast"

const MessageInput = () => {
  const [text, setText] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {sendMessage} = useChatStore()

  const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if(!file?.type.startsWith("image/")) {
        toast.error("Please select an image file")
        return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
        setImagePreview(reader.result as string)
    }
  }

  const removeImagePreview = () => {
    setImagePreview(null)
    if(fileInputRef.current){
        fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if(!text.trim() && !imagePreview) return
    try {
        await sendMessage({
            text,
            image: imagePreview!
        })
        // clear the form
        setText("")
        removeImagePreview()
    } catch (error) {
        console.log("Error sending message:", error);
    }
  }
  return (
    <div className="p-4 w-full">
        {imagePreview && (
            <div className="mb-3 flex items-center gap-2">
                <div className="relative">
                    <img 
                        src={imagePreview} 
                        alt="preview"
                        className="w-20 h-20 object-cover rounded-lg border-zinc-700" 
                    />
                    <button
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
                        type="button"
                        onClick={removeImagePreview}
                    >
                        <X className="size-3" />
                    </button>
                </div>
            </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="flex-1 gap-2 flex">
                <input 
                    type="text" 
                    className="input input-bordered w-full rounded-lg input-sm sm:input-md"
                    placeholder="Type a message"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <input 
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleChangeImage}
                />
                <button 
                    type="button"
                    className={`hidden sm:flex btn btn-circle ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Image className="size-5" />
                </button>
            </div>
            <button
                type="submit"
                className="btn btn-sm btn-circle"
                disabled={!text.trim() && !imagePreview}
                >
                <Send size={22} />
            </button>
        </form>
    </div>
  )
}

export default MessageInput