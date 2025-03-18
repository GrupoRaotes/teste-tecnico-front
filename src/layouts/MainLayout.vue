<template>
  <div class="q-pa-md q-gutter-sm full-width">
    <q-table
      class="my-sticky-dynamic full-width"
      flat bordered
      title="Medidas"
      :rows="filteredRows"
      :columns="columns"
      row-key="id"
      :visible-columns="visibleColumns"
    >
      <template v-slot:top>
        <img
          style="height: 50px; width: 50px; margin-right: 7px;"
          src="https://cdn.quasar.dev/logo-v2/svg/logo.svg"
        >
        <div class="q-px-md col-sm-7 col-md-9">
          <q-input
            v-model="searchText"
            debounce="500"
            filled
            placeholder="Digite para buscar"
            class="full-width"
          > 
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <q-btn
          color="primary"
          icon="add"
          label="Cadastrar"
          @click="abrirModal"
        />
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          {{ props.row.status ? 'Ativo' : 'Desativado' }}
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            color="primary"
            icon="edit"
            dense
            flat
            @click="editarItem(props.row)"
          />
          <q-btn
            color="negative"
            icon="delete"
            dense
            flat
            @click="excluirItem(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="modalAberto">
      <q-card style="min-width: 300px; max-width: 500px; width: 100%;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ modalTitle }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="salvarRegistro" class="q-gutter-md">
            <q-input
              v-model="novoItem.descricao"
              filled
              label="Descrição*"
              :rules="[
                val => !!val || 'Campo obrigatório',
                val => val.length <= 100 || 'Máximo de 100 caracteres'
              ]"
            />
            <q-input
              v-model="novoItem.sigla"
              filled  
              label="Sigla*"
              :rules="[
                val => !!val || 'Campo obrigatório',
                val => (val.length >= 1 && val.length <= 3) || 'A sigla deve ter até 3 caracteres'
              ]"
            />
            <q-input
              v-model="novoItem.codigo_erp"
              filled
              label="Código ERP"
              :rules="[
                val => !val || /^[A-Z0-9]{0,5}$/.test(val) || 'De 0 a 5 caracteres alfanuméricos maiúsculos'
              ]"
            />
            <q-select
              v-model="novoItem.status"
              filled
              label="Status*"
              :options="[
               { label: 'Ativo', value: true },
               { label: 'Desativado', value: false }
              ]"
              :rules="[val => val !== null || 'Campo obrigatório']"
            />
            <q-card-actions align="right">
              <q-btn flat label="Cancelar" v-close-popup color="red" />
              <q-btn flat label="Salvar" type="submit" color="primary" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

const columns = [
  { name: 'id', align: 'center', label: 'ID', field: 'id', sortable: true },
  { name: 'codigo_erp', align: 'center', label: 'Código ERP', field: 'codigo_erp', sortable: true },
  { name: 'sigla', align: 'center', label: 'Sigla', field: 'sigla', sortable: true },
  { name: 'descricao', align: 'center', label: 'Descrição', field: 'descricao', sortable: true },
  { name: 'status', align: 'center', label: 'Status', field: 'status', sortable: true },
  { name: 'actions', align: 'center', label: 'Ações', field: 'actions', sortable: false },
];

export default {
  setup() {
    const modalAberto = ref(false);
    const novoItem = ref({
      id: null,
      codigo_erp: null,
      sigla: '',
      descricao: '',
      status: true,
    });
    const rows = ref([]);
    const searchText = ref('');

    const carregarDados = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/medidas');
        const data = await response.json();
        rows.value = data;
      } catch (error) {
        alert('Erro ao carregar medidas: ' + error.message);
      }
    };

    onMounted(() => {
      carregarDados();
    });

    const abrirModal = () => {
      novoItem.value = { id: null, codigo_erp: null, sigla: '', descricao: '', status: true };
      modalAberto.value = true;
    };

    const editarItem = (item) => {
      novoItem.value = { ...item };
      modalAberto.value = true;
    };

    const excluirItem = async (item) => {
      try {
        await fetch(`http://localhost:3000/api/medidas/${item.id}`, {
          method: 'DELETE',
        });
        rows.value = rows.value.filter(row => row.id !== item.id);
        alert('Item excluído com sucesso!');
      } catch (error) {
        alert('Erro ao excluir item: ' + error.message);
      }
    };

    
    const salvarRegistro = async () => {
      try {
        const url = novoItem.value.id
          ? `http://localhost:3000/api/medidas/${novoItem.value.id}`
          : 'http://localhost:3000/api/medidas';

        const method = novoItem.value.id ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novoItem.value),
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert(errorData.error);
          return;
        }

        const savedItem = await response.json();
        if (novoItem.value.id) {
          const index = rows.value.findIndex(row => row.id === savedItem.id);
          rows.value[index] = savedItem;
        } else {
          rows.value.push(savedItem);
        }
        alert('Item salvo com sucesso!');
        modalAberto.value = false;
      } catch (error) {
        alert('Erro ao salvar item: ' + error.message);
      }
    };

    const filteredRows = computed(() => {
      if (!searchText.value) {
        return rows.value;
      }
      const search = searchText.value.toLowerCase();
      return rows.value.filter(row => {
        return (
          String(row.id).toLowerCase().includes(search) ||
          String(row.codigo_erp).toLowerCase().includes(search) ||
          String(row.sigla).toLowerCase().includes(search) ||
          String(row.descricao).toLowerCase().includes(search) ||
          (row.status ? 'ativo' : 'desativado').includes(search)
        );
      });
    });

    return {
      modalAberto,
      novoItem,
      abrirModal,
      editarItem,
      excluirItem,
      salvarRegistro,
      searchText,
      visibleColumns: ref(['id', 'codigo_erp', 'sigla', 'descricao', 'status', 'actions']),
      columns,
      rows,
      filteredRows,
    };
  },
};
</script>

<style lang="sass">
.my-sticky-dynamic
  .q-table__bottom,
  thead tr:first-child th
    background-color: lightblue
    
  thead tr:first-child th
    top: 0

  thead tr:last-child th
    top: 48px

  tbody
    scroll-margin-top: 48px
</style>