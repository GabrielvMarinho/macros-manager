# Documentação da Biblioteca Python para Automação SAP

Esta biblioteca Python fornece uma interface para interagir com o SAP GUI usando o `win32com.client`. Ela permite automatizar tarefas, como preenchimento de campos, navegação por menus, execução de transações, extração de dados e muito mais.


## Instalação

1. **Instale o pacote `pywin32`:**

   ```bash
   pip install pywin32
   ```

2. **Instale o pacote `pyautogui`:**
   ```bash
   pip install pyautogui
   ```

3. **Crie o arquivo `language_dict.py`:** Esse arquivo deve conter a classe `Language`  e seu construtor conforme descrito no código fornecido, implementando a lógica para busca de termos traduzidos.  Um exemplo simplificado seria:


## Uso

```python
from sap_functions import SAP

# Inicialização. Especifique o índice da janela SAP (0 para a primeira janela),
# as credenciais se for execução agendada e o idioma.
scheduled_execution = {'scheduled?': False, 'username': 'login', 'password': 'password', 'principal': '100'} # Modifique se for execução agendada
sap = SAP(window=0, scheduled_execution=scheduled_execution, language="PT") 

# Selecionar uma transação
sap.select_transaction("VA01")

# Preencher um campo de texto
sap.write_text_field("Material", "123456")

# Selecionar uma opção em um campo de combinação (combobox)
sap.choose_text_combo("Unidade medida", "PC")

# Marcar um campo de seleção (checkbox)
sap.flag_field("Entrega parcial", True)

# Pressionar um botão
sap.press_button("Salvar")

# Obter a mensagem do rodapé
message = sap.get_footer_message()
print(message)

# ... outras operações ...
```

## Atributos da Instância

Estes são atributos definidos para cada objeto `SAP` criado:

*   `self.session`: O objeto principal `GuiSession` do `win32com` que representa a sessão SAP ativa sendo controlada.
*   `self.connection`: O objeto `GuiConnection` que contém a(s) sessão(ões).
*   `self.window`: Armazena o índice (como string) da janela SAP ativa (ex: '0', '1') detectado por `__active_window`. Usado para construir IDs de elementos.
*   `self.language`: Uma instância da classe `Language` (de `language_dict.py`) usada para obter mensagens traduzidas.
*   `self.idiom`: String que armazena o código do idioma (ex: "pt", "en") passado na inicialização.
*   `self.scheduled_execution`: Dicionário contendo informações sobre execução agendada e credenciais, usado principalmente por `__open_sap`.
*   `self.field_name`, `self.desired_text`, `self.desired_operator`, `self.target_index`, `self.side_index`: Atributos temporários usados para passar parâmetros para as funções de busca e interação internas (como `__scroll_through_fields` e `__generic_conditionals`).
*   `self.found_text`: Usado por `get_text_at_side` para armazenar o texto encontrado.

## Métodos Públicos

---

### `__init__(self, window: int, scheduled_execution: dict, language: str)`

*   **Descrição:** Inicializa o objeto `SAP`. Tenta conectar-se a uma instância SAP existente ou abrir uma nova se `scheduled_execution['scheduled?']` for `True`. Realiza verificações iniciais (logon, sistema, idioma). Garante que o número necessário de sessões SAP esteja aberto.
*   **Parâmetros:**
    *   `window` (int): O índice da janela/sessão SAP a ser controlada (0 para a primeira, 1 para a segunda, etc.).
    *   `scheduled_execution` (dict): Dicionário contendo:
        *   `'scheduled?'` (bool): Indica se é uma execução agendada (tentará abrir e logar no SAP).
        *   `'principal'`, `'username'`, `'password'` (str): Credenciais usadas se `scheduled?` for `True`.
    *   `language` (str): O código do idioma desejado (ex: "pt", "en") para mensagens e para verificar a correspondência com o idioma da sessão SAP.
*   **Notas:**
    *   Chama `__verify_sap_open` para obter a conexão.
    *   Mostra `messagebox.showerror` e encerra (`exit()`) se o SAP não estiver aberto (e não for agendado) ou se o usuário não estiver logado.
    *   Imprime avisos se o sistema for 'EQ0' ou se o idioma da sessão não corresponder ao solicitado.
    *   Chama `__count_sap_screens` para criar sessões adicionais, se necessário.
    *   Define `self.session` e `self.window`.

---

### `select_transaction(self, transaction: str)`

*   **Descrição:** Abre uma transação específica na sessão SAP controlada.
*   **Parâmetros:**
    *   `transaction` (str): O código da transação a ser aberta (ex: "VA01", "CJ20N").
*   **Notas:**
    *   Usa `session.startTransaction`.
    *   Lida com um popup específico de perfil ("Perfil BD") que pode aparecer para certas transações (como as de "CN").
    *   Verifica se a transação foi realmente iniciada comparando `session.info.transaction`. Se falhar, mostra um `messagebox.showerror` com a mensagem do rodapé e encerra (`exit()`).

---

### `select_main_screen(self)`

*   **Descrição:** Navega de volta para a tela inicial do SAP Easy Access (transação `SESSION_MANAGER`).
*   **Parâmetros:** Nenhum.
*   **Notas:**
    *   Verifica se já está na tela inicial (`SESSION_MANAGER`) antes de tentar navegar.
    *   Usa `session.startTransaction('SESSION_MANAGER')`.
    *   Lida com um possível popup (`wnd[1]`) que pode aparecer ao encerrar a transação anterior.

---

### `clean_all_fields(self, selected_tab=0)`

*   **Descrição:** Percorre a tela ou aba atual e tenta limpar o conteúdo de todos os campos de texto editáveis (`GuiCTextField`).
*   **Parâmetros:**
    *   `selected_tab` (int, Opcional, Padrão=0): O índice da aba a ser limpa (0 para a primeira aba).
*   **Notas:**
    *   Usa a função privada `__scroll_through_tabs` para encontrar a área correta.
    *   Itera sobre os `Children` da área e define `child.Text = ""` para `GuiCTextField`.
    *   Inclui tratamento de exceção básico (`try...except`) para falhas ao definir o texto e imprime o erro.

---

### `run_actual_transaction(self)`

*   **Descrição:** Simula o pressionamento da tecla Enter (VKey 0) ou do botão Executar (VKey 8) na tela atual do SAP para prosseguir com a transação ou ação padrão.
*   **Parâmetros:** Nenhum.
*   **Notas:**
    *   Primeiro envia VKey 0 (Enter).
    *   Se o título da janela não mudar após enviar Enter (indicando que Enter pode não ter sido a ação principal), tenta enviar VKey 8 (Executar/F8).
    *   Usa `try...except` para o caso de a janela ativa mudar ou desaparecer após o primeiro VKey.

---

### `insert_variant(self, variant_name: str)`

*   **Descrição:** Seleciona e aplica uma variante de transação.
*   **Parâmetros:**
    *   `variant_name` (str): O nome da variante a ser aplicada.
*   **Notas:**
    *   Assume a interface padrão de seleção de variantes (`wnd[1]`) aberta após pressionar o botão "Obter variante" (`btn[17]`).
    *   Preenche o nome da variante e limpa o campo do nome do usuário para buscar variantes globais.
    *   Inclui tratamento de exceção (`try...except`) e imprime erros.

---

### `change_active_tab(self, selected_tab: int)`

*   **Descrição:** Muda para uma aba específica na tela atual.
*   **Parâmetros:**
    *   `selected_tab` (int): O índice da aba de destino (base 0).
*   **Retorna:** Nenhum (`None`).
*   **Notas:**
    *   Usa `__scroll_through_tabs` para encontrar o objeto da aba.
    *   Chama o método `.Select()` no objeto da aba.
    *   Inclui tratamento de exceção (`try...except`) e imprime erros. Usado internamente por outros métodos que aceitam `selected_tab`.

---

### `write_text_field(self, field_name: str, desired_text: str, target_index=0, selected_tab=0)`

*   **Descrição:** Escreve um valor de texto em um campo de entrada identificado pela sua etiqueta (label) associada.
*   **Parâmetros:**
    *   `field_name` (str): O texto da etiqueta (label) associada ao campo de entrada.
    *   `desired_text` (str): O texto a ser escrito no campo.
    *   `target_index` (int, Opcional, Padrão=0): Usado se houver múltiplos campos com a mesma etiqueta. 0 para o primeiro, 1 para o segundo, etc.
    *   `selected_tab` (int, Opcional, Padrão=0): O índice da aba onde procurar o campo.
*   **Retorna:** `Boolean` - `True` se a escrita foi realizada com sucesso (campo encontrado e texto definido), `False` caso contrário.
*   **Notas:**
    *   Define atributos internos (`self.field_name`, etc.) e chama `__scroll_through_fields` com `objective='write_text_field'`.
    *   Assume que o campo de entrada está imediatamente após (`index + 1`) a etiqueta nos `Children`.

---

### `write_text_field_until(self, field_name: str, desired_text: str, target_index=0, selected_tab=0)`

*   **Descrição:** Similar a `write_text_field`, mas escreve no campo que está três posições após a etiqueta.
*   **Parâmetros:**
    *   `field_name` (str): O texto da etiqueta (label).
    *   `desired_text` (str): O texto a ser escrito.
    *   `target_index` (int, Opcional, Padrão=0): Índice da ocorrência da etiqueta.
    *   `selected_tab` (int, Opcional, Padrão=0): Índice da aba.
*   **Retorna:** `Boolean` - `True` se sucesso, `False` caso contrário.
*   **Notas:**
    *   Usado para cenários específicos onde o campo alvo está deslocado (ex: campos "Até" em intervalos).
    *   Assume que o campo de entrada está três posições após (`index + 3`) a etiqueta.
    *   Chama `__scroll_through_fields` com `objective='write_text_field_until'`.

---

### `choose_text_combo(self, field_name: str, desired_text: str, target_index=0, selected_tab=0)`

*   **Descrição:** Seleciona um item em um campo combobox (`GuiComboBox`) com base no texto visível do item.
*   **Parâmetros:**
    *   `field_name` (str): O texto da etiqueta (label) associada ao combobox.
    *   `desired_text` (str): O texto do item a ser selecionado dentro do combobox.
    *   `target_index` (int, Opcional, Padrão=0): Índice da ocorrência da etiqueta.
    *   `selected_tab` (int, Opcional, Padrão=0): Índice da aba.
*   **Retorna:** `Boolean` - `True` se sucesso, `False` caso contrário.
*   **Notas:**
    *   Chama `__scroll_through_fields` com `objective='choose_text_combo'`.
    *   Itera pelas `Entries` do combobox (encontrado em `index + 1`) e compara `entry.Value` com `desired_text` para definir a `key`.

---

### `flag_field(self, field_name: str, desired_operator: bool, target_index=0, selected_tab=0)`

*   **Descrição:** Marca (`True`) ou desmarca (`False`) um checkbox (`GuiCheckBox`) identificado por sua etiqueta.
*   **Parâmetros:**
    *   `field_name` (str): O texto da etiqueta (label) associada ao checkbox.
    *   `desired_operator` (bool): `True` para marcar, `False` para desmarcar.
    *   `target_index` (int, Opcional, Padrão=0): Índice da ocorrência da etiqueta.
    *   `selected_tab` (int, Opcional, Padrão=0): Índice da aba.
*   **Retorna:** `Boolean` - `True` se sucesso, `False` caso contrário.
*   **Notas:**
    *   Chama `__scroll_through_fields` com `objective='flag_field'`.
    *   Assume que o controle checkbox *é* o próprio elemento com o `Text` igual a `field_name`.

---

### `flag_field_at_side(self, field_name: str, desired_operator: bool, side_index=1, target_index=0, selected_tab=0)`

*   **Descrição:** Marca (`True`) ou desmarca (`False`) um checkbox (`GuiCheckBox`) que está posicionado ao lado (em um índice relativo) de uma etiqueta.
*   **Parâmetros:**
    *   `field_name` (str): O texto da etiqueta (label) de referência.
    *   `desired_operator` (bool): `True` para marcar, `False` para desmarcar.
    *   `side_index` (int, Opcional, Padrão=1): O deslocamento do índice a partir da etiqueta para encontrar o checkbox (ex: 1 para o controle logo após a etiqueta).
    *   `target_index` (int, Opcional, Padrão=0): Índice da ocorrência da etiqueta.
    *   `selected_tab` (int, Opcional, Padrão=0): Índice da aba.
*   **Retorna:** `Boolean` - `True` se sucesso, `False` caso contrário.
*   **Notas:**
    *   Chama `__scroll_through_fields` com `objective='flag_field_at_side'`.
    *   Útil quando a etiqueta e o checkbox são controles separados.

---

### `option_field(self, field_name: str, target_index=0, selected_tab=0)`

*   **Descrição:** Seleciona um radio button (`GuiRadioButton`) identificado por sua etiqueta.
*   **Parâmetros:**
    *   `field_name` (str): O texto da etiqueta (label) associada ao radio button.
    *   `target_index` (int, Opcional, Padrão=0): Índice da ocorrência da etiqueta.
    *   `selected_tab` (int, Opcional, Padrão=0): Índice da aba.
*   **Retorna:** `Boolean` - `True` se sucesso, `False` caso contrário.
*   **Notas:**
    *   Chama `__scroll_through_fields` com `objective='option_field'`.
    *   Chama o método `.Select()` no radio button encontrado.

---

### `press_button(self, field_name: str, target_index=0, selected_tab=0)`

*   **Descrição:** Pressiona um botão (`GuiButton`) identificado pelo seu texto ou tooltip. Também tenta interagir com botões em toolbars de grids (CJ20N/MD04).
*   **Parâmetros:**
    *   `field_name` (str): O texto visível ou o texto do tooltip do botão.
    *   `target_index` (int, Opcional, Padrão=0): *Embora presente, este parâmetro não parece ser usado ativamente na lógica de `press_button` em `__generic_conditionals`*. A primeira ocorrência encontrada será pressionada.
    *   `selected_tab` (int, Opcional, Padrão=0): Índice da aba.
*   **Retorna:** `Boolean` - `True` se um botão correspondente foi encontrado e `.press()` (ou método similar para toolbars) foi chamado, `False` caso contrário.
*   **Notas:**
    *   Busca em toda a janela (`wnd[self.window]`), não apenas na área de usuário (`/usr`), para incluir toolbars.
    *   Chama `__scroll_through_fields` com `objective='press_button'`.
    *   Inclui lógica específica para `GetButtonTooltip` e `pressButton` em grids ALV para transações como CJ20N e MD04.

---

### `find_text_field(self, field_name: str, selected_tab=0)`

*   **Descrição:** Verifica se um determinado texto (geralmente uma etiqueta ou parte dela) existe em qualquer controle visível na tela ou aba atual.
*   **Parâmetros:**
    *   `field_name` (str): O texto a ser procurado.
    *   `selected_tab` (int, Opcional, Padrão=0): Índice da aba.
*   **Retorna:** `Boolean` - `True` se o texto for encontrado em algum `.Text` de um controle, `False` caso contrário.
*   **Notas:**
    *   Realiza uma busca ampla na área do usuário (`/usr`).
    *   Chama `__scroll_through_fields` com `objective='find_text_field'`.

---

### `get_text_at_side(self, field_name, side_index: int, target_index=0, selected_tab=0)`

*   **Descrição:** Captura o texto de um campo que está posicionado relativamente (por `side_index`) a um campo de etiqueta (label).
*   **Parâmetros:**
    *   `field_name` (str): O texto da etiqueta (label) do campo de referência.
    *   `side_index` (int): O índice relativo do campo cujo texto deve ser capturado, contando a partir da etiqueta (ex: 1 para o campo imediatamente após, 2 para o segundo).
    *   `target_index` (int, Opcional, Padrão=0): Índice da ocorrência da etiqueta.
    *   `selected_tab` (int, Opcional, Padrão=0): Índice da aba.
*   **Retorna:** `String` - O texto do campo encontrado, ou `None` se não encontrado ou ocorrer erro.
*   **Notas:**
    *   Chama `__scroll_through_fields` com `objective='get_text_at_side'`.
    *   Armazena o resultado em `self.found_text` e o retorna.

---

### `multiple_selection_field(self, field_name: str, target_index=0, selected_tab=0)`

*   **Descrição:** Pressiona o botão "Seleção múltipla" (geralmente ao lado de um campo de entrada) associado a uma etiqueta.
*   **Parâmetros:**
    *   `field_name` (str): O texto da etiqueta associada ao campo que possui o botão de seleção múltipla.
    *   `target_index` (int, Opcional, Padrão=0): Índice da ocorrência da etiqueta.
    *   `selected_tab` (int, Opcional, Padrão=0): Índice da aba.
*   **Retorna:** `Boolean` - `True` se o botão foi encontrado e pressionado, `False` caso contrário.
*   **Notas:**
    *   Assume a estrutura comum onde o botão de seleção múltipla segue o campo de entrada.
    *   Constrói o nome esperado do botão (ex: `...-VALU_PUSH`).
    *   Chama `__scroll_through_fields` com `objective='multiple_selection_field'`.

---

### `multiple_selection_paste_data(self, data: str)`

*   **Descrição:** Cola dados de uma string em uma janela de seleção múltipla do SAP que já deve estar aberta (`wnd[1]`). Os dados são primeiro escritos em um arquivo temporário.
*   **Parâmetros:**
    *   `data` (str): A string contendo os dados a serem colados (geralmente um item por linha).
*   **Notas:**
    *   **Importante:** Assume que a janela de seleção múltipla (`wnd[1]`) já está ativa no SAP.
    *   Cria um arquivo temporário `C:/Temp/temp_paste.txt`. Certifique-se de que o diretório `C:/Temp` existe e é gravável.
    *   Usa o botão "Importar do arquivo" (`btn[23]`) na janela `wnd[1]` e preenche o diálogo (`wnd[2]`) para carregar do arquivo temporário.
    *   Exclui o arquivo temporário após a operação.
    *   Inclui tratamento de exceção (`try...except`) e imprime erros.

---

### `navigate_into_menu_header(self, path: str)`

*   **Descrição:** Navega pela barra de menus principal do SAP seguindo um caminho especificado.
*   **Parâmetros:**
    *   `path` (str): O caminho do menu, com os itens separados por ponto e vírgula (ex: "Sistema;Status" ou "Tratar;Salvar").
*   **Notas:**
    *   Verifica se o caminho contém ';'. Se não, mostra um `messagebox.showerror` e encerra (`exit()`).
    *   Itera pelos níveis do menu, encontrando o `GuiMenu` correspondente a cada parte do caminho e construindo o ID completo.
    *   Chama `.Select()` no item de menu final.
    *   Inclui tratamento de exceção (`try...except`) e imprime erros.

---

### `save_file(self, file_name: str, path: str, option=0, type_of_file='txt')`

*   **Descrição:** Salva a visualização atual do SAP (geralmente um relatório ou tabela) em um arquivo local.
*   **Parâmetros:**
    *   `file_name` (str): O nome do arquivo a ser salvo (sem a extensão).
    *   `path` (str): O caminho completo da pasta onde o arquivo será salvo (ex: "C:/Temp").
    *   `option` (int, Opcional, Padrão=0): Índice da opção de formato de salvamento (radio button `radSPOPLI-SELFLAG`) na janela de salvamento do SAP. Ignorado se `type_of_file` for "xls".
    *   `type_of_file` (str, Opcional, Padrão="txt"): A extensão/tipo do arquivo (ex: "txt", "xls"). Se contiver "xls", usa um caminho de menu diferente ("Planilha") em vez de "Arquivo local".
*   **Notas:**
    *   Usa caminhos de menu diferentes (`menu[0]/menu[1]/menu[1]` para XLS, `menu[0]/menu[1]/menu[2]` para outros).
    *   Interage com as janelas de diálogo padrão (`wnd[1]`) do SAP para salvar arquivos.

---

### `view_in_list_form(self)`

*   **Descrição:** Tenta ativar o modo de visualização "Pré-visualização de Impressão" em um grid ALV, acessando o menu de contexto da toolbar do grid.
*   **Parâmetros:** Nenhum.
*   **Notas:**
    *   Primeiro chama `get_my_grid()` para obter o objeto grid.
    *   Usa `pressToolbarContextButton("&MB_VIEW")` e `SelectContextMenuItem("&PRINT_BACK_PREVIEW")`.
    *   Assume que um grid ALV está presente e ativo.

---

### `get_my_table(self)`

*   **Descrição:** Procura e retorna o principal objeto de tabela `GuiTableControl` na área do usuário da tela atual.
*   **Retorna:** `Object` - O objeto `GuiTableControl` encontrado, ou `False` (retornado por `__scroll_through_table`) se não encontrado.
*   **Notas:**
    *   **Distinção Importante:** Projetado para tabelas mais antigas (`GuiTableControl`), não para Grids ALV (`GuiShell`). Para ALVs, use `get_my_grid`.
    *   Depende da função privada `__scroll_through_table`.

---

### `my_table_get_cell_value(self, my_table, row_index: int, column_index: int)`

*   **Descrição:** Obtém o valor de texto de uma célula específica em um objeto `GuiTableControl`.
*   **Parâmetros:**
    *   `my_table` (Object): O objeto `GuiTableControl` (obtido com `get_my_table`).
    *   `row_index` (int): O índice da linha (base 0).
    *   `column_index` (int): O índice da coluna (base 0).
*   **Retorna:** `String` - O texto da célula, ou a string 'Empty' se ocorrer um erro ao acessar a célula (ex: índice fora dos limites).
*   **Notas:**
    *   Específico para `GuiTableControl`.

---

### `get_my_grid(self)`

*   **Descrição:** Procura e retorna o principal objeto Grid ALV (`GuiShell` que contém dados tabulares) na área do usuário da tela atual.
*   **Retorna:** `Object` - O objeto `GuiShell` representando o grid ALV, ou `False` (retornado por `__scroll_through_grid`) se não encontrado.
*   **Notas:**
    *   Projetado para Grids ALV modernos. Para tabelas antigas, use `get_my_table`.
    *   Depende da função privada `__scroll_through_grid`.

---

### `my_grid_select_layout(self, layout: str)`

*   **Descrição:** Aplica um layout específico (variante de exibição) a um grid ALV, usando filtro e seleção.
*   **Parâmetros:**
    *   `layout` (str): O nome do layout a ser aplicado.
*   **Notas:**
    *   Obtém o grid usando `get_my_grid()`.
    *   Simula cliques de menu de contexto (`contextMenu`, `selectContextMenuItem`) e preenchimento da janela de filtro (`wnd[2]`) para selecionar o layout desejado.
    *   Assume a estrutura padrão das janelas de diálogo para seleção de layout/variante em ALVs.

---

### `get_my_grid_count_rows(self, my_grid)`

*   **Descrição:** Conta o número total de linhas em um Grid ALV, forçando o carregamento de todas as linhas rolando a visualização ("page down") se necessário.
*   **Parâmetros:**
    *   `my_grid` (Object): O objeto Grid ALV (obtido com `get_my_grid`).
*   **Retorna:** `int` - O número total de linhas de dados no grid (propriedade `RowCount`).
*   **Notas:**
    *   Usa as propriedades `RowCount`, `VisibleRowCount`, e `firstVisibleRow` para simular a rolagem e garantir que `RowCount` reflita o total real.
    *   Inclui tratamento de erro (`try...except`) básico para a rolagem.

---

### `get_footer_message(self)`

*   **Descrição:** Obtém a mensagem de texto exibida na barra de status (rodapé) do SAP.
*   **Parâmetros:** Nenhum.
*   **Retorna:** `String` - O texto completo da barra de status (`wnd[0]/sbar`).
*   **Notas:** Útil para capturar mensagens de sucesso, erro ou aviso após uma ação.

---

## Métodos Privados

Estes métodos são usados internamente pela classe `SAP` e não se destinam a serem chamados diretamente.

*   `__verify_sap_open()`: Verifica se o SAP GUI está rodando e retorna o objeto `GuiApplication`. Tenta abrir e logar se for execução agendada.
*   `__open_sap()`: Lógica para abrir o `saplogon.exe`, conectar-se, e fazer login (usado em execuções agendadas).
*   `__count_sap_screens(window: int)`: Garante que o número especificado de sessões SAP esteja aberto, criando novas se necessário.
*   `__active_window()`: Determina e retorna o índice da janela SAP ativa (ex: '0').
*   `__scroll_through_tabs(area, extension, selected_tab)`: Navega recursivamente para encontrar a área de conteúdo de uma aba específica.
*   `__scroll_through_grid(extension)`: Navega recursivamente para encontrar o principal objeto `GuiShell` (ALV Grid).
*   `__scroll_through_table(extension)`: Navega recursivamente para encontrar o principal objeto `GuiTableControl`.
*   `__scroll_through_fields(extension, objective, selected_tab)`: Função central recursiva para encontrar controles (labels, campos, botões) dentro de containers (tabs, sub-screens) e passar para `__generic_conditionals`.
*   `__generic_conditionals(index, children, objective)`: Contém a lógica específica para cada `objective` (write_text_field, flag_field, press_button, etc.), interagindo com os controles SAP encontrados por `__scroll_through_fields`.

---
