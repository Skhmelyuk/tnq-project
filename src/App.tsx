
import axios from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item"
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

import { useRef } from "react";

interface NotesDTO {
  id: string;
  content: string;
  completed: boolean;
}


export function App() {

 const { 
    data: notes = [],
    isPending,
    isFetching,
    isError,
    refetch
  } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const res = await axios.get<NotesDTO[]>("http://localhost:3000/notes")
      return res.data
    }
  })

   const queryClient = useQueryClient()

  const inputRef = useRef<HTMLInputElement>(null)


  const addNote = useMutation({
    mutationFn: async ( content: string ) => {
      const res = await axios.post<NotesDTO>("http://localhost:3000/notes", {
        content,
        completed: false,
      })
      return res.data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["notes"]})
      if (inputRef.current) inputRef.current.value = ""
    }
  })

  return (
    <main className="mx-auto max-w-lg p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Нотатки {isFetching && !isPending && "(Оновлення...)"}
          </CardTitle>
          <Button  onClick={() => refetch()}>
            Оновити
          </Button>
        </CardHeader>

        <form className="flex gap-2">
          <Input ref={inputRef} placeholder="Нова замітка..." />
          <Button 
            type="button" 
            disabled={addNote.isPending}
            onClick={() => {
              const content = inputRef.current?.value.trim()
              if (!content) return
              addNote.mutate(content)
            }}
          >
            {addNote.isPending ? "Додавання..." : "Додати"}
          </Button>
        </form>

        <CardContent className="flex flex-col gap-3">
          {isPending && <p className="text-sm text-muted-foreground">Завантаження...</p>}
          {isError && <p className="text-sm text-destructive">Помилка завантаження</p>}
          {!isPending && !isError && notes.length === 0 && (
            <p className="text-sm text-muted-foreground">Список порожній</p>
          )}

          <ItemGroup className="gap-2">
            {notes.map((note) => (
              <Item key={note.id} variant="outline" size="sm">
                <ItemContent>
                  <ItemTitle>{note.content}</ItemTitle>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </CardContent>
      </Card>
    </main>
  )
}

export default App
