const { useState, useEffect } = require('./hooks');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function useNotes() {
  const [notes, setNotes] = useState(()=>[]);
  const [nextId, setNextId] = useState(1);

  const addNote = (title, content) => {
    setNotes(prev => [...prev, { id: nextId.value, title, content, timestamp: new Date() }]);
    setNextId(prev => prev + 1);
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const searchNotes = (query) => {
    return notes.value.filter(note => 
      note.title.toLowerCase().includes(query.toLowerCase()) || 
      note.content.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getMemoryUsage = () => {
    let totalSize = 0;
    notes.value.forEach(note => {
      // Approximate size calculation
      totalSize += JSON.stringify(note).length * 2; // Unicode characters are 2 bytes each
    });
    return totalSize;
  };

  return { notes, addNote, deleteNote, searchNotes, getMemoryUsage };
}

function NoteApp({setRunning } ) {
    const { notes, addNote, deleteNote, searchNotes, getMemoryUsage } = useNotes();

  const listNotes = () => {
    console.log('\nAll Notes:');
    if (notes.value.length === 0) {
      console.log('No notes yet.');
    } else {
      notes.value.forEach(note => {
        console.log(`ID: ${note.id} | Title: ${note.title} | Date: ${note.timestamp.toLocaleString()}`);
      });
    }
  };

  const viewNote = (id) => {
    const note = notes.value.find(n => n.id === id);
    if (note) {
      console.log(`\nID: ${note.id}`);
      console.log(`Title: ${note.title}`);
      console.log(`Date: ${note.timestamp.toLocaleString()}`);
      console.log(`Content: ${note.content}`);
    } else {
      console.log(`Note with ID ${id} not found.`);
    }
  };

  const displayMemoryUsage = () => {
    const usage = getMemoryUsage();
    console.log(`\nApproximate memory usage of notes:`);
    console.log(`${usage} bytes`);
    console.log(`${(usage / 1024).toFixed(2)} KB`);
    console.log(`${(usage / 1024 / 1024).toFixed(2)} MB`);
  };

  function promptUser() {
    rl.question('\nEnter command (add/list/view/search/delete/memory/quit): ', (command) => {
      switch(command.toLowerCase()) {
        case 'add':
          rl.question('Enter note title: ', (title) => {
            rl.question('Enter note content: ', (content) => {
              addNote(title, content);
              console.log('Note added successfully.');
              promptUser();
            });
          });
          break;
        case 'list':
          listNotes();
          promptUser();
          break;
        case 'view':
          rl.question('Enter note ID to view: ', (id) => {
            viewNote(Number(id));
            promptUser();
          });
          break;
        case 'search':
          rl.question('Enter search query: ', (query) => {
            const results = searchNotes(query);
            console.log('\nSearch Results:');
            if (results.length === 0) {
              console.log('No matching notes found.');
            } else {
              results.forEach(note => {
                console.log(`ID: ${note.id} | Title: ${note.title} | Date: ${note.timestamp.toLocaleString()}`);
              });
            }
            promptUser();
          });
          break;
        case 'delete':
          rl.question('Enter note ID to delete: ', (id) => {
            deleteNote(Number(id));
            console.log(`Note ${id} has been deleted.`);
            promptUser();
          });
          break;
        case 'memory':
          displayMemoryUsage();
          promptUser();
          break;
        case 'quit':
          setRunning(false);
          break;
        default:
          console.log('Unknown command. Please try again.');
          promptUser();
      }
    });
  }
    
    promptUser();
}

const run = ()=>{
    console.log('Welcome to the Note-Taking App!');

    const [running, setRunning] = useState(true);

    useEffect(() => {
        if (!running.value) {
            console.log('\nThank you for using the Note-Taking App!');
            rl.close();
        }
    }, [running]);

    // Run the Note-Taking App
    NoteApp({ setRunning });
}

run()
