        async (payload) => {
          const newRow = payload.new as CommentRow;
          // Check if comment already exists
          setComments((prev) => {
            if (prev.some((c) => c.id === newRow.id)) return prev;
            
            // Fetch profile for the new comment asynchronously
            (async () => {
              try {
                const { data: profile, error } = await supabase
                  .from('profiles')
                  .select('id, name, handle, avatar_url')
                  .eq('id', newRow.user_id)
                  .single();

                if (error) {
                  console.error('Failed to fetch profile for new comment:', error);
                }

                const newComment: Comment = {
                  ...newRow,
                  profiles: profile
                    ? { name: profile.name, handle: profile.handle, avatar_url: profile.avatar_url }
                    : null,
                };
                
                setComments((cur) => {
                  if (cur.some((c) => c.id === newRow.id)) return cur;
                  const updated = [...cur, newComment];
                  onCountChange(updated.length);
                  return updated;
                });
              } catch (err) {
                console.error('Error processing new comment:', err);
              }
            })();
            
            return prev;
          });
        }