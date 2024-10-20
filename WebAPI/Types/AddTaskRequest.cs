using System.ComponentModel.DataAnnotations;

namespace WebAPI.Types
{
    public class AddTaskRequest
    {
        [Required]
        public Guid Uid { get; set; }

        [Required]
        public string TaskProcessorType { get; set; } = null!;
    }
}
