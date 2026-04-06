import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { TaskDto } from '../../../shared/models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './task-list.component.html'
})
export class TaskListComponent implements OnInit {
  tasks: TaskDto[] = [];
  filter: 'all' | 'today' | 'overdue' = 'all';
  today = new Date().toISOString().split('T')[0];

  constructor(private taskService: TaskService) { }

  ngOnInit() {
    this.loadAllTasks();
  }

  loadAllTasks() {
    this.taskService.getAll().subscribe(data => this.tasks = data);
  }

  loadTodayTasks() {
    this.taskService.getToday().subscribe(data => this.tasks = data);
  }

  loadOverdueTasks() {
    this.taskService.getOverdue().subscribe(data => this.tasks = data);
  }

  changeFilter(newFilter: 'all' | 'today' | 'overdue') {
    this.filter = newFilter;

    if (newFilter === 'today') this.loadTodayTasks();
    else if (newFilter === 'overdue') this.loadOverdueTasks();
    else this.loadAllTasks();
  }

  updateStatus(taskId: number, status: string) {
    this.taskService.updateStatus(taskId, status).subscribe({
      next: () => {
        Swal.fire('Успешно', 'Статус обновлён', 'success');
        this.changeFilter(this.filter);
      }
    });
  }

  deleteTask(id: number) {
    Swal.fire({
      title: 'Удалить задачу?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Да, удалить'
    }).then(result => {
      if (result.isConfirmed) {
        this.taskService.delete(id).subscribe(() => {
          Swal.fire('Удалено', '', 'success');
          this.changeFilter(this.filter);
        });
      }
    });
  }

  getPriorityClass(priority: string): string {
    if (priority === 'HIGH') return 'text-danger fw-bold';
    if (priority === 'MEDIUM') return 'text-warning';
    return 'text-success';
  }

  getStatusClass(status: string): string {
    const map: any = {
      'NEW': 'bg-info',
      'IN_PROGRESS': 'bg-primary',
      'COMPLETED': 'bg-success',
      'OVERDUE': 'bg-danger'
    };
    return map[status] || 'bg-secondary';
  }
}